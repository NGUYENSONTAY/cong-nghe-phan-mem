import { api } from './api';
import { Order, OrderStatus, PaginatedResponse } from '../types';

// Convert backend OrderSummaryDTO -> frontend Order
const adaptOrder = (o: any): Order => {
  return {
    _id: (o.id ?? o._id ?? '').toString(),
    user: {} as any,
    items: (o.orderItems ?? o.items ?? []).map((it: any) => ({
      book: {
        _id: (it.bookId ?? '').toString(),
        title: it.bookTitle ?? '',
        author: it.bookAuthor ?? '',
        description: '',
        price: Number(it.price ?? 0),
        quantity: 0,
        category: { _id: '', name: '', description: '', createdAt: '', updatedAt: '' },
        images: it.bookImageUrl ? [it.bookImageUrl] : [],
        createdAt: '',
        updatedAt: '',
      },
      quantity: it.quantity ?? 1,
      price: Number(it.price ?? 0),
    })),
    totalAmount: Number(o.totalAmount ?? 0),
    customerName: o.userName ?? o.userFullName ?? '',
    address: o.shippingAddress ?? '',
    phone: '',
    email: o.userEmail ?? '',
    status: o.status as OrderStatus,
    note: '',
    createdAt: o.orderDate ?? o.createdAt ?? '',
    updatedAt: o.updatedAt ?? '',
  } as Order;
};

export interface CheckoutData {
  customerName: string;
  address: string;
  phone: string;
  email: string;
  note?: string;
  paymentMethod: 'COD' | 'ONLINE';
  items: { bookId: string; quantity: number }[];
}

export const orderAPI = {
  createOrder: async (orderData: CheckoutData): Promise<Order> => {
    console.log('📦 Frontend order data:', orderData);
    
    // Transform frontend data to backend format
    const backendOrderData = {
      shippingAddress: orderData.address, // address -> shippingAddress
      paymentMethod: orderData.paymentMethod,
      orderItems: orderData.items.map(item => ({
        bookId: parseInt(item.bookId), // string -> number
        quantity: item.quantity
      }))
    };
    
    console.log('📤 Backend order data:', backendOrderData);
    
    const response = await api.post('/orders', backendOrderData);
    console.log('✅ Backend response:', response.data);
    return adaptOrder(response.data);
  },

  getUserOrders: async (page: number = 0, size: number = 20): Promise<Order[]> => {
    const response = await api.get('/orders/my-orders', { params: { page, size } });
    const data = response.data;
    if (Array.isArray(data)) return data.map(adaptOrder);
    if (data && Array.isArray(data.content)) return data.content.map(adaptOrder);
    return [];
  },

  // --- Admin Functions ---

  getAllOrders: async (
    page: number,
    limit: number,
    status?: OrderStatus
  ): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders/admin/all', {
      params: { page, size: limit, status },
    });
    
    const backendData = response.data;
    
    // Adapt backend Spring Boot pagination format to frontend format  
    return {
      data: backendData.content ? backendData.content.map(adaptOrder) : [],
      totalItems: backendData.totalElements || 0,
      totalPages: backendData.totalPages || 0,
      currentPage: backendData.number || 0,
    };
  },

  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return adaptOrder(response.data);
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await api.patch(`/orders/admin/${id}/status`, null, {
      params: { status }
    });
    return adaptOrder(response.data);
  },
}; 