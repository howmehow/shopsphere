package main

import (
	"log"
	"os"

	"shopsphere-backend/config"
	"shopsphere-backend/handlers"
	"shopsphere-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {

	config.ConnectDatabase()
	defer config.CloseDatabase()

	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	authHandler := handlers.NewAuthHandler()
	productHandler := handlers.NewProductHandler()
	reviewHandler := handlers.NewReviewHandler()
	chatHandler := handlers.NewChatHandler()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"message": "ShopSphere Backend is running",
		})
	})

	v1 := r.Group("/api/v1")
	{
		auth := v1.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		protected := v1.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{

			user := protected.Group("/user")
			{
				user.GET("/profile", authHandler.GetProfile)
				user.PUT("/profile", authHandler.UpdateProfile)
				user.POST("/change-password", authHandler.ChangePassword)
			}

			products := protected.Group("/products")
			{
				products.GET("", productHandler.GetProducts)
				products.GET("/:id", productHandler.GetProduct)
			}

			sellerProducts := protected.Group("/products")
			sellerProducts.Use(middleware.RequireSellerRole())
			{
				sellerProducts.POST("", productHandler.CreateProduct)
				sellerProducts.PUT("/:id", productHandler.UpdateProduct)
				sellerProducts.DELETE("/:id", productHandler.DeleteProduct)
				sellerProducts.GET("/seller/my-products", productHandler.GetSellerProducts)
			}

			reviews := protected.Group("/reviews")
			{
				reviews.GET("", reviewHandler.GetReviews)
				reviews.GET("/:id", reviewHandler.GetReview)
				reviews.GET("/product/:product_id", reviewHandler.GetProductReviews)
				reviews.GET("/product/:product_id/stats", reviewHandler.GetReviewStat)
				reviews.POST("", reviewHandler.CreateReview)
				reviews.PUT("/:id", reviewHandler.UpdateReview)
				reviews.DELETE("/:id", reviewHandler.DeleteReview)
				reviews.GET("/user/my-reviews", reviewHandler.GetUserReviews)
			}

			chat := protected.Group("/chat")
			{
				chat.GET("/rooms", chatHandler.GetChatRooms)
				chat.POST("/rooms", chatHandler.CreateChatRoom)
				chat.GET("/room/:id", chatHandler.GetChatRoom)
				chat.GET("/room/:id/messages", chatHandler.GetChatMessages)
				chat.POST("/messages", chatHandler.SendMessage)
				chat.DELETE("/room/:id/leave", chatHandler.LeaveChatRoom)
				chat.POST("/room/:id/participants", chatHandler.AddParticipant)
			}
		}
	}

	public := r.Group("/api/v1/public")
	{
		public.GET("/products", productHandler.GetProducts)
		public.GET("/products/:id", productHandler.GetProduct)
		public.GET("/reviews/product/:product_id", reviewHandler.GetProductReviews)
		public.GET("/product/:product_id", reviewHandler.GetProductReviews)
		public.GET("/reviews/product/:product_id/stats", reviewHandler.GetReviewStat)
		public.GET("/reviews", reviewHandler.GetAllReviews)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
