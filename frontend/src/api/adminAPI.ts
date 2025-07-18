import { api } from './api';

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  totalCategories: number;
  totalAuthors: number;
  orderStatistics: {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
  };
  totalRevenue: number;
}

export interface OverviewStats {
  books: {
    total: number;
    available: number;
  };
  categories: {
    total: number;
  };
  authors: {
    total: number;
  };
  orders: {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  totalRevenue: number;
}

export interface BookStatistics {
  totalBooks: number;
  availableBooks: number;
  outOfStockBooks: number;
}

const getDashboard = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

const getOverview = async (): Promise<OverviewStats> => {
  const response = await api.get('/admin/overview');
  return response.data;
};

const getBooksStatistics = async (): Promise<BookStatistics> => {
  const response = await api.get('/admin/books/statistics');
  return response.data;
};

const getBestSellers = async (limit: number = 10) => {
  const response = await api.get('/admin/bestsellers', { params: { limit } });
  return response.data;
};

const getLargestOrders = async () => {
  const response = await api.get('/admin/largest-orders');
  return response.data;
};

export const adminAPI = {
  getDashboard,
  getOverview,
  getBooksStatistics,
  getBestSellers,
  getLargestOrders,
}; 