package handlers

import (
	"log"
	"net/http"
	"strconv"
	"sync"

	"shopsphere-backend/config"
	"shopsphere-backend/middleware"
	"shopsphere-backend/models"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type ChatHandler struct {
	upgrader websocket.Upgrader
	clients  map[string]*websocket.Conn
	mutex    sync.RWMutex
}

func NewChatHandler() *ChatHandler {
	return &ChatHandler{
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {

				return true
			},
		},
		clients: make(map[string]*websocket.Conn),
	}
}

func (h *ChatHandler) GetChatRooms(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	var chatRooms []models.ChatRoom
	if err := config.GetDB().
		Joins("JOIN chat_room_users ON chat_rooms.id = chat_room_users.room_id").
		Where("chat_room_users.user_id = ?", userID).
		Order("chat_rooms.updated_at DESC").
		Find(&chatRooms).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch chat rooms"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"chat_rooms": chatRooms})
}

func (h *ChatHandler) GetChatRoom(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	roomID := c.Param("id")

	var participant models.ChatRoomUser
	if err := config.GetDB().Where("room_id = ? AND user_id = ?", roomID, userID).First(&participant).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a participant in this chat room"})
		return
	}

	var chatRoom models.ChatRoom
	if err := config.GetDB().Where("id = ?", roomID).First(&chatRoom).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Chat room not found"})
		return
	}

	var participants []models.User
	if err := config.GetDB().
		Joins("JOIN chat_room_users ON users.id = chat_room_users.user_id").
		Where("chat_room_users.room_id = ?", roomID).
		Find(&participants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch participants"})
		return
	}

	response := gin.H{
		"chat_room":    chatRoom,
		"participants": participants,
	}

	c.JSON(http.StatusOK, response)
}

func (h *ChatHandler) CreateChatRoom(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	var req models.CreateChatRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	chatRoom := models.ChatRoom{
		Name:      req.Name,
		Type:      req.Type,
		CreatedBy: userID,
	}

	if err := config.GetDB().Create(&chatRoom).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create chat room"})
		return
	}

	participant := models.ChatRoomUser{
		RoomID: chatRoom.ID,
		UserID: userID,
	}
	if err := config.GetDB().Create(&participant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add creator as participant"})
		return
	}

	for _, participantID := range req.Participants {
		if participantID != userID {

			var user models.User
			if err := config.GetDB().Where("id = ?", participantID).First(&user).Error; err != nil {
				continue
			}

			participant := models.ChatRoomUser{
				RoomID: chatRoom.ID,
				UserID: participantID,
			}
			config.GetDB().Create(&participant)
		}
	}

	c.JSON(http.StatusCreated, chatRoom)
}

func (h *ChatHandler) GetChatMessages(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	roomID := c.Param("id")

	var participant models.ChatRoomUser
	if err := config.GetDB().Where("room_id = ? AND user_id = ?", roomID, userID).First(&participant).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a participant in this chat room"})
		return
	}

	page := 1
	limit := 50
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

	var messages []models.ChatMessage
	if err := config.GetDB().
		Where("room_id = ?", roomID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	userID, username, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	var req models.ChatMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var participant models.ChatRoomUser
	if err := config.GetDB().Where("room_id = ? AND user_id = ?", req.RoomID, userID).First(&participant).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a participant in this chat room"})
		return
	}

	if req.MessageType == "" {
		req.MessageType = "text"
	}

	message := models.ChatMessage{
		RoomID:      req.RoomID,
		UserID:      userID,
		UserName:    username,
		Message:     req.Message,
		MessageType: req.MessageType,
	}

	if err := config.GetDB().Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	config.GetDB().Model(&models.ChatRoom{}).Where("id = ?", req.RoomID).Update("updated_at", message.CreatedAt)

	h.broadcastMessage(req.RoomID, message)

	c.JSON(http.StatusCreated, message)
}

func (h *ChatHandler) HandleWebSocket(c *gin.Context) {

	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token required"})
		return
	}

	claims, err := middleware.ValidateToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	roomID := c.Param("id")

	var participant models.ChatRoomUser
	if err := config.GetDB().Where("room_id = ? AND user_id = ?", roomID, claims.UserID).First(&participant).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a participant in this chat room"})
		return
	}

	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}
	defer conn.Close()

	clientKey := roomID + ":" + claims.UserID
	h.mutex.Lock()
	h.clients[clientKey] = conn
	h.mutex.Unlock()

	defer func() {
		h.mutex.Lock()
		delete(h.clients, clientKey)
		h.mutex.Unlock()
	}()

	for {
		var msg models.ChatMessageRequest
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}

		if msg.RoomID != roomID || msg.Message == "" {
			continue
		}

		if msg.MessageType == "" {
			msg.MessageType = "text"
		}

		message := models.ChatMessage{
			RoomID:      msg.RoomID,
			UserID:      claims.UserID,
			UserName:    claims.Username,
			Message:     msg.Message,
			MessageType: msg.MessageType,
		}

		if err := config.GetDB().Create(&message).Error; err != nil {
			log.Printf("Failed to save message: %v", err)
			continue
		}

		config.GetDB().Model(&models.ChatRoom{}).Where("id = ?", msg.RoomID).Update("updated_at", message.CreatedAt)

		h.broadcastMessage(roomID, message)
	}
}

func (h *ChatHandler) broadcastMessage(roomID string, message models.ChatMessage) {
	h.mutex.RLock()
	defer h.mutex.RUnlock()

	for clientKey, conn := range h.clients {

		if len(clientKey) > len(roomID) && clientKey[:len(roomID)] == roomID {
			err := conn.WriteJSON(message)
			if err != nil {
				log.Printf("WebSocket write error: %v", err)
				conn.Close()
				delete(h.clients, clientKey)
			}
		}
	}
}

func (h *ChatHandler) LeaveChatRoom(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	roomID := c.Param("id")

	if err := config.GetDB().Where("room_id = ? AND user_id = ?", roomID, userID).Delete(&models.ChatRoomUser{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to leave chat room"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Left chat room successfully"})
}

func (h *ChatHandler) AddParticipant(c *gin.Context) {
	userID, _, _, ok := middleware.GetUserFromContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	roomID := c.Param("id")

	var req struct {
		UserID string `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var participant models.ChatRoomUser
	if err := config.GetDB().Where("room_id = ? AND user_id = ?", roomID, userID).First(&participant).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a participant in this chat room"})
		return
	}

	var targetUser models.User
	if err := config.GetDB().Where("id = ?", req.UserID).First(&targetUser).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var existingParticipant models.ChatRoomUser
	if err := config.GetDB().Where("room_id = ? AND user_id = ?", roomID, req.UserID).First(&existingParticipant).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User is already a participant"})
		return
	}

	newParticipant := models.ChatRoomUser{
		RoomID: roomID,
		UserID: req.UserID,
	}

	if err := config.GetDB().Create(&newParticipant).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add participant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Participant added successfully"})
}
