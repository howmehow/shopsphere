package handlers

import (
	"net/http"
	"strconv"

	"shopsphere-backend/config"
	"shopsphere-backend/middleware"
	"shopsphere-backend/models"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct{}

func NewReviewHandler() *ReviewHandler {
	return &ReviewHandler{}
}

func (h *ReviewHandler) GetReviews(c *gin.Context) {
	var reviews []models.Review
	query := config.GetDB()

	if productID := c.Query("product_id"); productID != "" {
		query = query.Where("product_id = ?", productID)
	}

	if userID := c.Query("user_id"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	if rating := c.Query("rating"); rating != "" {
		if r, err := strconv.Atoi(rating); err == nil && r >= 1 && r <= 5 {
			query = query.Where("rating = ?", r)
		}
	}

	page := 1
	limit := 20
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
	query.Model(&models.Review{}).Count(&total)

	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	response := gin.H{
		"reviews": reviews,
		"pagination": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": (total + int64(limit) - 1) / int64(limit),
		},
	}

	c.JSON(http.StatusOK, response)
}

func (h *ReviewHandler) GetReview(c *gin.Context) {
	reviewID := c.Param("id")

	var review models.Review
	if err := config.GetDB().Where("id = ?", reviewID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, review)
}

func (h *ReviewHandler) GetAllReviews(c *gin.Context) {
	var reviews []models.Review
	if err := config.GetDB().Where("true").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	response := gin.H{
		"reviews": reviews,
	}

	c.JSON(http.StatusOK, response)
}

func (h *ReviewHandler) GetProductReviews(c *gin.Context) {
	productID := c.Param("product_id")

	var product models.Product
	if err := config.GetDB().Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var reviews []models.Review
	if err := config.GetDB().Where("product_id = ?", productID).Order("created_at DESC").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	var avgRating float64
	if len(reviews) > 0 {
		var totalRating int
		for _, review := range reviews {
			totalRating += review.Rating
		}
		avgRating = float64(totalRating) / float64(len(reviews))
	}

	response := gin.H{
		"reviews":        reviews,
		"total_reviews":  len(reviews),
		"average_rating": avgRating,
	}

	c.JSON(http.StatusOK, response)
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	userID, username, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	var req models.ReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var product models.Product
	if err := config.GetDB().Where("id = ?", req.ProductID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var existingReview models.Review
	if err := config.GetDB().Where("product_id = ? AND user_id = ?", req.ProductID, userID).First(&existingReview).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "You have already reviewed this product"})
		return
	}

	review := models.Review{
		ProductID: req.ProductID,
		UserID:    userID,
		UserName:  username,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}

	if err := config.GetDB().Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create review"})
		return
	}

	c.JSON(http.StatusCreated, review)
}

func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	userID, username, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	reviewID := c.Param("id")

	var req struct {
		Rating  int    `json:"rating" binding:"required,min=1,max=5"`
		Comment string `json:"comment"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var review models.Review
	if err := config.GetDB().Where("id = ?", reviewID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if review.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own reviews"})
		return
	}

	review.Rating = req.Rating
	review.Comment = req.Comment
	review.UserName = username

	if err := config.GetDB().Save(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update review"})
		return
	}

	c.JSON(http.StatusOK, review)
}

func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	reviewID := c.Param("id")

	var review models.Review
	if err := config.GetDB().Where("id = ?", reviewID).First(&review).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if review.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only delete your own reviews"})
		return
	}

	if err := config.GetDB().Delete(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete review"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review deleted successfully"})
}

func (h *ReviewHandler) GetUserReviews(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	var reviews []models.Review
	if err := config.GetDB().Where("user_id = ?", userID).Order("created_at DESC").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reviews"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

func (h *ReviewHandler) GetReviewStat(c *gin.Context) {
	productID := c.Param("product_id")

	var product models.Product
	if err := config.GetDB().Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var stats struct {
		TotalReviews       int         `json:"total_reviews"`
		AverageRating      float64     `json:"average_rating"`
		RatingDistribution map[int]int `json:"rating_distribution"`
	}

	var reviews []models.Review
	if err := config.GetDB().Where("product_id = ?", productID).Find(&reviews).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch review statistics"})
		return
	}

	stats.TotalReviews = len(reviews)
	stats.RatingDistribution = make(map[int]int)

	if len(reviews) > 0 {
		var totalRating int
		for _, review := range reviews {
			totalRating += review.Rating
			stats.RatingDistribution[review.Rating]++
		}
		stats.AverageRating = float64(totalRating) / float64(len(reviews))
	}

	for i := 1; i <= 5; i++ {
		if _, exists := stats.RatingDistribution[i]; !exists {
			stats.RatingDistribution[i] = 0
		}
	}

	c.JSON(http.StatusOK, stats)
}
