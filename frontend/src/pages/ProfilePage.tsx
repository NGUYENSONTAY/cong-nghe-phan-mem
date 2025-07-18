import React from 'react';
import UpdateProfileForm from '../components/profile/UpdateProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Loading from '../components/common/Loading';

const ProfilePage: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Loading /></div>
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="bg-gray-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">Chào, {user.name}!</h1>
            <p className="text-lg text-gray-600">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
          </div>
          <UpdateProfileForm />
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 