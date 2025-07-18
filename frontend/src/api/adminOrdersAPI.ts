import { api } from './api';
import { PaginatedResponse, Order, OrderStatus } from '../types';

// Reuse same adapter as orderAPI
const adaptOrder = (o: any): Order => ({
  _id: (o.id ?? o._id ?? '').toString(),
  user: { _id: '', email: o.userEmail ?? '', name: o.userName ?? '' } as any,
  items: (o.orderItems ?? []).map((it: any) => ({
    book: {
      _id: (it.bookId ?? '').toString(),
      title: it.bookTitle ?? '',
      author: it.bookAuthor ?? '',
      description: '',
      price: Number(it.price ?? 0),
      quantity: 0,
      category: { _id: '', name: '', description: '', createdAt: '', updatedAt: ''},
      images: it.bookImageUrl ? [it.bookImageUrl] : [],
      createdAt: '',
      updatedAt: '',
    },
    quantity: it.quantity ?? 1,
    price: Number(it.price ?? 0),
  })),
  totalAmount: Number(o.totalAmount ?? 0),
  customerName: o.userName ?? '',
  address: o.shippingAddress ?? '',
  phone: '',
  email: o.userEmail ?? '',
  status: o.status as OrderStatus,
  note: '',
  createdAt: o.orderDate ?? '',
  updatedAt: '',
});

export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export const adminOrdersAPI = {
  // Get all orders with pagination
  getOrders: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'desc',
    filter?: {
      status?: string;
      userEmail?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PaginatedResponse<Order>> => {
    const params: any = {
      page,
      size,
      sortBy,
      sortDir,
      ...filter
    };
    
    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    console.log('📤 Fetching admin orders with params:', params);
    
    const response = await api.get('/orders/admin/all', { params });
    const data = response.data;
    
    console.log('📥 Admin orders response:', data);
    
    // Transform backend response to frontend format
    return {
      data: (data.content || []).map(adaptOrder),
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      totalItems: data.totalElements || 0
    };
  },

  // Get order by ID
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const response = await api.patch(`/orders/admin/${id}/status`, null, { params: { status } });
    return adaptOrder(response.data);
  },

  // Get orders by status
  getOrdersByStatus: async (
    status: Order['status'],
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<Order>> => {
    const response = await api.get(`/orders/admin/status/${status}`, {
      params: { page, size }
    });
    const data = response.data;
    
    // Transform backend response to frontend format
    return {
      data: data.content || [],
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      totalItems: data.totalElements || 0
    };
  },

  // Get order statistics
  getOrderStatistics: async (): Promise<OrderStatistics> => {
    const response = await api.get('/orders/admin/statistics');
    return response.data;
  },

  // Get revenue statistics
  getRevenueStatistics: async (): Promise<{
    totalRevenue: number;
    monthlyRevenue: { [key: string]: number };
  }> => {
    const response = await api.get('/orders/admin/revenue');
    return response.data;
  },

  // Get monthly statistics
  getMonthlyStats: async (): Promise<Array<{
    month: string;
    year: number;
    totalOrders: number;
    totalRevenue: number;
  }>> => {
    const response = await api.get('/orders/admin/monthly-stats');
    return response.data;
  },

  // Get largest orders
  getLargestOrders: async (limit: number = 10): Promise<Order[]> => {
    const response = await api.get('/orders/admin/largest-orders', {
      params: { limit }
    });
    return response.data;
  },

  // Delete order (admin only)
  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/admin/${id}`);
  },

  // Bulk update order status
  bulkUpdateStatus: async (orderIds: string[], status: Order['status']): Promise<void> => {
    await api.patch('/orders/admin/bulk-status', {
      orderIds,
      status
    });
  },
};
