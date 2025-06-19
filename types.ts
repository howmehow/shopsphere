
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
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface GeneratedDescription {
  description: string;
}