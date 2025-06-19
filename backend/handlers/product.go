package handlers

import (
	"net/http"
	"regexp"
	"strconv"

	"shopsphere-backend/config"
	"shopsphere-backend/middleware"
	"shopsphere-backend/models"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct{}

func NewProductHandler() *ProductHandler {
	return &ProductHandler{}
}

func (h *ProductHandler) GetProducts(c *gin.Context) {
	var products []models.Product
	query := config.GetDB()

	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}

	if sellerID := c.Query("seller_id"); sellerID != "" {
		query = query.Where("seller_id = ?", sellerID)
	}

	if search := c.Query("search"); search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	page := 1
	limit := 200
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}

	offset := (page - 1) * limit

	var total int64
	query.Model(&models.Product{}).Count(&total)

	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	response := gin.H{
		"products": products,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}

	c.JSON(http.StatusOK, response)
}

func (h *ProductHandler) GetProduct(c *gin.Context) {
	productID := c.Param("id")
	p, hasSeller := extractSecondUUID(productID)
	if hasSeller {
		productID = p
	}
	var product models.Product
	if err := config.GetDB().Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}
func extractSecondUUID(input string) (string, bool) {
	re := regexp.MustCompile(`^seller-.*?-([a-fA-F0-9-]{36})$`)
	matches := re.FindStringSubmatch(input)
	if len(matches) == 2 {
		return matches[1], true
	}
	return "", false
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	userID, username, role, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	if role != "seller" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only sellers can create products"})
		return
	}

	var req models.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := models.Product{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		ImageURL:    req.ImageURL,
		SellerID:    userID,
		SellerName:  username,
		Category:    req.Category,
	}

	if err := config.GetDB().Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, product)
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	userID, username, role, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	if role != "seller" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only sellers can update products"})
		return
	}

	productID := c.Param("id")

	var req models.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := config.GetDB().Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if product.SellerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own products"})
		return
	}

	product.Name = req.Name
	product.Description = req.Description
	product.Price = req.Price
	product.ImageURL = req.ImageURL
	product.Category = req.Category
	product.SellerName = username

	if err := config.GetDB().Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	c.JSON(http.StatusOK, product)
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	userID, _, role, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	if role != "seller" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only sellers can delete products"})
		return
	}

	productID := c.Param("id")

	var product models.Product
	if err := config.GetDB().Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if product.SellerID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own products"})
		return
	}

	if err := config.GetDB().Where("product_id = ?", productID).Delete(&models.Review{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete associated reviews"})
		return
	}

	if err := config.GetDB().Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

func (h *ProductHandler) GetSellerProducts(c *gin.Context) {
	userID, _, role, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	if role != "seller" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only sellers can access this endpoint"})
		return
	}

	var products []models.Product
	if err := config.GetDB().Where("seller_id = ?", userID).Order("created_at DESC").Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}
