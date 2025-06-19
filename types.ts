
export interface User {
  id: string;
  username: string;
  role: 'seller' | 'customer';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  category: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string; // Could be anonymous or linked to a user concept
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string; // ISO date string
}

export interface CartItem extends Product {
  quantity: number;
}

// For Gemini service
export interface GeneratedDescription {
  description: string;
}