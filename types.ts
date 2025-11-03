export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner',
}

export enum OrderStatus {
  PENDING = 'Pending',
  READY = 'Ready',
  COMPLETED = 'Completed',
}

export interface Product {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface User {
  email: string;
  role: UserRole;
  name?: string;
}