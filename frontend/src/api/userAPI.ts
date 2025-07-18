import { api } from './api';
import { User, AuthResponse, LoginRequest, RegisterRequest, PaginatedResponse, ChangePasswordRequest } from '../types';

export type UserUpdateData = {
  name: string;
  address: string;
  phone: string;
};

export type AdminUserUpdateData = {
  role: 'USER' | 'ADMIN';
  // You could add other fields here, e.g., isAccountLocked
};

// Adapter function to transform backend user response to frontend format
const transformBackendUser = (backendUser: any): User => {
  return {
    _id: backendUser.id.toString(),
    email: backendUser.email,
    name: `${backendUser.firstName} ${backendUser.lastName}`,
    address: backendUser.address,
    phone: backendUser.phone,
    role: backendUser.role === 'CUSTOMER' ? 'USER' : 'ADMIN',
    createdAt: backendUser.createdAt || new Date().toISOString(),
    updatedAt: backendUser.updatedAt || new Date().toISOString(),
  };
};

export const userAPI = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return transformBackendUser(response.data);
  },

  updateProfile: async (data: UserUpdateData): Promise<User> => {
    const response = await api.put('/users/me', data);
    return transformBackendUser(response.data);
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put('/users/me/password', data);
  },
  
  // --- Admin Functions ---

  getAllUsers: async (page: number, limit: number): Promise<PaginatedResponse<User>> => {
    const response = await api.get('/users', { params: { page, limit } });
    
    const backendData = response.data;
    
    // Adapt backend Spring Boot pagination format to frontend format
    return {
      data: backendData.content?.map(transformBackendUser) || [],
      totalItems: backendData.totalElements || 0,
      totalPages: backendData.totalPages || 0,
      currentPage: backendData.number || 0,
    };
  },

  updateUser: async (userId: string, data: AdminUserUpdateData): Promise<User> => {
    const response = await api.patch(`/users/${userId}`, data);
    return transformBackendUser(response.data);
  },
}; 