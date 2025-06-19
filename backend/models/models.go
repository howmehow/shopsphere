package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Username  string    `json:"username" gorm:"uniqueIndex;not null"`
	Password  string    `json:"-" gorm:"not null"`
	Role      string    `json:"role" gorm:"not null;check:role IN ('seller', 'customer')"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

type Product struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string    `json:"name" gorm:"not null"`
	Description string    `json:"description" gorm:"type:text"`
	Price       float64   `json:"price" gorm:"not null;check:price >= 0"`
	ImageURL    string    `json:"imageUrl" gorm:"column:image_url"`
	SellerID    string    `json:"sellerId" gorm:"column:seller_id;not null"`
	SellerName  string    `json:"sellerName" gorm:"column:seller_name;not null"`
	Category    string    `json:"category" gorm:"not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	Seller  User     `json:"-" gorm:"foreignKey:SellerID;references:ID"`
	Reviews []Review `json:"-" gorm:"foreignKey:ProductID;references:ID"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = uuid.New().String()
	}
	return nil
}

type Review struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	ProductID string    `json:"productId" gorm:"column:product_id;not null"`
	UserID    string    `json:"userId" gorm:"column:user_id;not null"`
	UserName  string    `json:"userName" gorm:"column:user_name;not null"`
	Rating    int       `json:"rating" gorm:"not null;check:rating >= 1 AND rating <= 5"`
	Comment   string    `json:"comment" gorm:"type:text"`
	CreatedAt time.Time `json:"createdAt" gorm:"column:created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Product Product `json:"-" gorm:"foreignKey:ProductID;references:ID"`
	User    User    `json:"-" gorm:"foreignKey:UserID;references:ID"`
}

func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	if r.CreatedAt.IsZero() {
		r.CreatedAt = time.Now()
	}
	return nil
}

type ChatRoom struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name      string    `json:"name" gorm:"not null"`
	Type      string    `json:"type" gorm:"not null;check:type IN ('direct', 'group')"`
	CreatedBy string    `json:"created_by" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Creator      User           `json:"-" gorm:"foreignKey:CreatedBy;references:ID"`
	Messages     []ChatMessage  `json:"-" gorm:"foreignKey:RoomID;references:ID"`
	Participants []ChatRoomUser `json:"-" gorm:"foreignKey:RoomID;references:ID"`
}

func (c *ChatRoom) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type ChatRoomUser struct {
	ID       uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	RoomID   string    `json:"room_id" gorm:"not null"`
	UserID   string    `json:"user_id" gorm:"not null"`
	JoinedAt time.Time `json:"joined_at" gorm:"default:CURRENT_TIMESTAMP"`

	Room ChatRoom `json:"-" gorm:"foreignKey:RoomID;references:ID"`
	User User     `json:"-" gorm:"foreignKey:UserID;references:ID"`
}

type ChatMessage struct {
	ID          string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	RoomID      string    `json:"room_id" gorm:"not null"`
	UserID      string    `json:"user_id" gorm:"not null"`
	UserName    string    `json:"user_name" gorm:"not null"`
	Message     string    `json:"message" gorm:"type:text;not null"`
	MessageType string    `json:"message_type" gorm:"default:'text';check:message_type IN ('text', 'image', 'file')"`
	CreatedAt   time.Time `json:"created_at"`

	Room ChatRoom `json:"-" gorm:"foreignKey:RoomID;references:ID"`
	User User     `json:"-" gorm:"foreignKey:UserID;references:ID"`
}

func (c *ChatMessage) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=seller customer"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type ProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,min=0"`
	ImageURL    string  `json:"imageUrl"`
	Category    string  `json:"category" binding:"required"`
}

type ReviewRequest struct {
	ProductID string `json:"productId" binding:"required"`
	UserID    string `json:"userId" binding:"required"`
	UserName  string `json:"userName" binding:"required"`
	Rating    int    `json:"rating" binding:"required,min=1,max=5"`
	Comment   string `json:"comment"`
}

type ChatMessageRequest struct {
	RoomID      string `json:"room_id" binding:"required"`
	Message     string `json:"message" binding:"required"`
	MessageType string `json:"message_type,omitempty"`
}

type CreateChatRoomRequest struct {
	Name         string   `json:"name" binding:"required"`
	Type         string   `json:"type" binding:"required,oneof=direct group"`
	Participants []string `json:"participants" binding:"required,min=1"`
}
