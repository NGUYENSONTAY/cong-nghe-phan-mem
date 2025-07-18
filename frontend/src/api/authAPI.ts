import { api } from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

// Adapter function to transform backend response to frontend format
const transformJwtResponse = (backendResponse: any): AuthResponse => {
  return {
    token: backendResponse.token,
    user: {
      _id: backendResponse.id.toString(),
      email: backendResponse.email,
      name: `${backendResponse.firstName} ${backendResponse.lastName}`,
      role: backendResponse.role === 'CUSTOMER' ? 'USER' : 'ADMIN',
      createdAt: new Date().toISOString(), // Backend doesn't return this in JWT response
      updatedAt: new Date().toISOString(), // Backend doesn't return this in JWT response
    }
  };
};

const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  // Ensure field name matches backend expectation
  const payload = {
    usernameOrEmail: credentials.usernameOrEmail,
    password: credentials.password,
  };
  const response = await api.post('/auth/login', payload);
  
  // Transform backend response to frontend format
  return transformJwtResponse(response.data);
};

const register = async (userData: RegisterRequest): Promise<any> => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const authAPI = {
  login,
  register,
}; 