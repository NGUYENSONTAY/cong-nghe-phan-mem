// ==================== GENERAL ====================

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

// ==================== BOOK, CATEGORY, AUTHOR ====================

export interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  quantity: number;
  category: Category;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// ==================== USER & AUTH ====================

export interface User {
  _id: string;
  email: string;
  name: string;
  username?: string; // Thêm username field
  address?: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// ==================== ORDER ====================

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  book: Book;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: User;
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  address: string;
  phone: string;
  email: string;
  status: OrderStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== CART ====================

export interface CartItem {
  _id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
} 