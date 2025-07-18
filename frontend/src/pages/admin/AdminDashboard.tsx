import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import Loading from '../../components/common/Loading';

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loading text="Đang kiểm tra quyền truy cập..." /></div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // The AdminLayout will render the nested routes via its <Outlet />
  return <AdminLayout />;
};

export default AdminDashboard; 