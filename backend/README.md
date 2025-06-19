# ShopSphere Backend

A comprehensive e-commerce backend built with Go, Gin, PostgreSQL, and WebSocket support for real-time chat functionality.

## Features

- **User Authentication**: JWT-based authentication with role-based access control (sellers/customers)
- **Product Management**: Full CRUD operations for products with category filtering and search
- **Review System**: Product reviews with ratings and statistics
- **Real-time Chat**: WebSocket-powered chat system for customer-seller communication
- **Database Integration**: PostgreSQL with GORM ORM
- **API Documentation**: RESTful API with comprehensive endpoints

## Tech Stack

- **Language**: Go 1.21+
- **Framework**: Gin Web Framework
- **Database**: PostgreSQL
- **ORM**: GORM
- **Authentication**: JWT tokens
- **Real-time**: WebSocket (Gorilla WebSocket)
- **Password Hashing**: bcrypt

## Prerequisites

- Go 1.21 or higher
- PostgreSQL 12 or higher
- Git

## Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE webapp;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE webapp TO postgres;
```

2. The application will automatically run migrations and seed initial data on startup.

## Installation & Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd shopsphere-backend
```

2. Install dependencies:
```bash
go mod download
```

3. Set environment variables (optional):
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=webapp
export DB_SSLMODE=disable
export JWT_SECRET=your-secret-key-change-in-production
export PORT=8080
export GIN_MODE=debug
```

4. Run the application:
```bash
go run main.go
```

The server will start on `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user

### User Profile
- `GET /api/v1/user/profile` - Get current user profile
- `PUT /api/v1/user/profile` - Update user profile
- `POST /api/v1/user/change-password` - Change password

### Products
- `GET /api/v1/products` - Get all products (with filtering)
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/categories` - Get all categories
- `POST /api/v1/products` - Create product (sellers only)
- `PUT /api/v1/products/:id` - Update product (sellers only)
- `DELETE /api/v1/products/:id` - Delete product (sellers only)
- `GET /api/v1/products/seller/my-products` - Get seller's products

### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `GET /api/v1/reviews/:id` - Get review by ID
- `GET /api/v1/reviews/product/:product_id` - Get product reviews
- `GET /api/v1/reviews/product/:product_id/stats` - Get review statistics
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `GET /api/v1/reviews/user/my-reviews` - Get user's reviews

### Chat
- `GET /api/v1/chat/rooms` - Get user's chat rooms
- `POST /api/v1/chat/rooms` - Create chat room
- `GET /api/v1/chat/rooms/:id` - Get chat room details
- `GET /api/v1/chat/rooms/:room_id/messages` - Get chat messages
- `POST /api/v1/chat/messages` - Send message
- `GET /api/v1/chat/rooms/:room_id/ws` - WebSocket endpoint for real-time chat
- `DELETE /api/v1/chat/rooms/:room_id/leave` - Leave chat room
- `POST /api/v1/chat/rooms/:room_id/participants` - Add participant

### Public Endpoints (No Authentication Required)
- `GET /api/v1/public/products` - Browse products
- `GET /api/v1/public/products/:id` - View product details
- `GET /api/v1/public/products/categories` - Get categories
- `GET /api/v1/public/reviews/product/:product_id` - View product reviews

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `password` (String, Hashed)
- `role` (String: 'seller' or 'customer')
- `created_at`, `updated_at` (Timestamps)

### Products Table
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `image_url` (String)
- `seller_id` (UUID, Foreign Key)
- `seller_name` (String)
- `category` (String)
- `created_at`, `updated_at` (Timestamps)

### Reviews Table
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key)
- `user_id` (UUID, Foreign Key)
- `user_name` (String)
- `rating` (Integer, 1-5)
- `comment` (Text)
- `created_at`, `updated_at` (Timestamps)

### Chat Tables
- `chat_rooms`: Chat room information
- `chat_room_users`: Many-to-many relationship for participants
- `chat_messages`: Individual messages

## Sample Data

The application includes a seeder that creates sample data:

### Sample Users
- **SuperStore** (seller) - password: `password123`
- **GadgetGalaxy** (seller) - password: `password123`
- **Alice** (customer) - password: `password123`
- **Bob** (customer) - password: `password123`

### Sample Products
- Modern Wireless Headphones ($79.99)
- Ergonomic Office Chair ($189.50)
- Organic Coffee Beans ($15.99)
- Smart Fitness Tracker ($49.99)
- Premium Yoga Mat ($29.99)
- Bluetooth Speaker ($39.99)

## WebSocket Usage

For real-time chat, connect to the WebSocket endpoint:
```
ws://localhost:8080/api/v1/chat/rooms/{room_id}/ws?token={jwt_token}
```

Send messages in JSON format:
```json
{
  "room_id": "room_id",
  "message": "Hello!",
  "message_type": "text"
}
```

## Development

### Project Structure
```
backend/
├── config/          # Database configuration
├── handlers/        # HTTP request handlers
├── middleware/      # Authentication middleware
├── models/          # Database models
├── seeds/           # Database seeder
├── go.mod          # Go module file
├── main.go         # Application entry point
└── README.md       # This file
```

### Adding New Features

1. Define models in `models/models.go`
2. Create handlers in `handlers/`
3. Add routes in `main.go`
4. Update database migrations in `config/database.go`

## Production Deployment

1. Set environment variables:
```bash
export GIN_MODE=release
export JWT_SECRET=your-secure-secret-key
export DB_HOST=your-db-host
export DB_PASSWORD=your-secure-password
```

2. Build the application:
```bash
go build -o shopsphere-backend main.go
```

3. Run the binary:
```bash
./shopsphere-backend
```

## Testing

Test the API endpoints using tools like:
- Postman
- curl
- Thunder Client (VS Code extension)

Example login request:
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "SuperStore", "password": "password123"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
