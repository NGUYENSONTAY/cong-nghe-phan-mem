import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '../api/authAPI';
import { userAPI } from '../api/userAPI';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../types';
import toast from 'react-hot-toast';
import Loading from '../components/common/Loading';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (newUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleAuthSuccess = (authResponse: AuthResponse) => {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    setUser(authResponse.user);
  }

  const updateUser = (newUser: User) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Đăng xuất thành công!');
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Luôn lấy thông tin user mới nhất từ API nếu có token
          const freshUser = await userAPI.getCurrentUser();
          localStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
        } catch (error) {
          toast.error('Phiên đăng nhập đã hết hạn.');
          logout(); 
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (credentials: LoginRequest) => {
    const response = await authAPI.login(credentials);
    handleAuthSuccess(response);
    toast.success(`Chào mừng trở lại, ${response.user.name}!`);
  };

  const register = async (userData: RegisterRequest) => {
    await authAPI.register(userData);
    toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  // Tránh render children khi đang loading lần đầu
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><Loading /></div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 