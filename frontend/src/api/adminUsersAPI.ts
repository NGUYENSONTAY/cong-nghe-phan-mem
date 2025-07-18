import { api } from './api';
import { PaginatedResponse, User } from '../types';

export const adminUsersAPI = {
  // Get all users with pagination
  getUsers: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'desc',
    filter?: {
      username?: string;
      email?: string;
      role?: string;
      enabled?: boolean;
    }
  ): Promise<PaginatedResponse<User>> => {
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

    console.log('📤 Fetching admin users with params:', params);
    
    const response = await api.get('/admin/users', { params });
    const data = response.data;
    
    console.log('📥 Admin users response:', data);
    
    // Transform backend response to frontend format
    return {
      data: data.content || [],
      totalPages: data.totalPages || 0,
      currentPage: data.number || 0,
      totalItems: data.totalElements || 0
    };
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // Toggle user status (enable/disable)
  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data;
  },

  // Change user role
  changeUserRole: async (id: string, role: 'CUSTOMER' | 'ADMIN'): Promise<User> => {
    const response = await api.patch(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  // Get user statistics
  getUserStatistics: async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    customerUsers: number;
  }> => {
    const response = await api.get('/admin/users/statistics');
    return response.data;
  },
};
