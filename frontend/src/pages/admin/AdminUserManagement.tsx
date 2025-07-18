import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { adminUsersAPI } from '../../api/adminUsersAPI';
import { User } from '../../types';
import Pagination from '../../components/common/Pagination';
import Loading from '../../components/common/Loading';
import { ConfirmModal } from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUser, FaSearch, FaFilter, FaUserShield, FaUserTie, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendar,
  FaEdit, FaTrash, FaCrown, FaUsers, FaUserCheck
} from 'react-icons/fa';

const AdminUserManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser } = useAuth();

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || '');
  const [showFilters, setShowFilters] = useState(false);

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const { data: response, isLoading, error } = useQuery(
    ['adminUsers', currentPage, searchTerm, selectedRole],
    () => adminUsersAPI.getUsers(currentPage - 1, 10)
  );
  
  const users = response?.data;
  const totalPages = response?.totalPages || 0;

  const updateUserMutation = useMutation(
    ({ userId, data }: { userId: string, data: Partial<User> }) => adminUsersAPI.updateUser(userId, data),
    {
      onSuccess: (updatedUser) => {
        toast.success(`Cập nhật vai trò cho ${updatedUser.name} thành công!`);
        queryClient.invalidateQueries(['adminUsers', currentPage]);
      },
      onError: (err: Error) => {
        toast.error(`Lỗi: ${err.message}`);
      }
    }
  );

  const handleRoleChange = (userId: string, newRole: 'USER' | 'ADMIN') => {
    if (userId === currentUser?._id) {
      toast.error('Bạn không thể thay đổi vai trò của chính mình.');
      return;
    }
    updateUserMutation.mutate({ userId, data: { role: newRole } });
  };
  
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('page', '1');
    if (searchTerm) params.set('search', searchTerm);
    if (selectedRole) params.set('role', selectedRole);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSearchParams({});
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = (user.name || user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = !selectedRole || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  }) || [];

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getRoleIcon = (role: string) => {
    return role === 'ADMIN' ? <FaCrown className="w-4 h-4" /> : <FaUser className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-800 border-purple-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getRoleText = (role: string) => {
    return role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng';
  };

  const calculateStats = () => {
    if (!users) return { total: 0, admins: 0, customers: 0 };
    
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'ADMIN').length,
      customers: users.filter(u => u.role === 'USER').length,
    };
  };

  const stats = calculateStats();

  if (isLoading) return <Loading text="Đang tải danh sách người dùng..." />;
  if (error) return <p className="text-red-500">Lỗi khi tải người dùng: {(error as Error).message}</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-600 mt-1">
            {response ? `${response.totalItems.toLocaleString()} người dùng` : 'Đang tải...'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 flex items-center"
          >
            <FaFilter className="w-4 h-4 mr-2" />
            Bộ lọc
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FaUsers className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FaCrown className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quản trị viên</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.admins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FaUserCheck className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Khách hàng</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.customers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả vai trò</option>
                <option value="USER">Khách hàng</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                >
                  Áp dụng
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Quick Stats Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          Hiển thị {filteredUsers.length} trên {users?.length || 0} người dùng
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedRole ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedRole ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Người dùng sẽ xuất hiện khi họ đăng ký tài khoản'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa chỉ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            user.role === 'ADMIN' ? 'bg-purple-100' : 'bg-blue-100'
                          }`}>
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.name || user.email || user.username || 'N/A'}
                            {user._id === currentUser?._id && (
                              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Bạn
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <FaEnvelope className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.phone && (
                          <div className="flex items-center mb-1">
                            <FaPhone className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {!user.phone && (
                          <span className="text-gray-400 italic text-sm">Chưa cập nhật</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {user.address ? (
                          <div className="flex items-start">
                            <FaMapMarkerAlt className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                            <span className="max-w-xs truncate">{user.address}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa cập nhật</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{getRoleText(user.role)}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaCalendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDateTime(user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {user._id !== currentUser?._id && (
                          <div className="relative group">
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center">
                              <FaEdit className="w-3 h-3 mr-1" />
                              Vai trò
                            </button>
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleRoleChange(user._id, 'USER')}
                                  disabled={user.role === 'USER'}
                                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                    user.role === 'USER' ? 'text-gray-400' : 'text-gray-700'
                                  }`}
                                >
                                  <FaUser className="w-3 h-3 mr-2 inline" />
                                  Khách hàng
                                </button>
                                <button
                                  onClick={() => handleRoleChange(user._id, 'ADMIN')}
                                  disabled={user.role === 'ADMIN'}
                                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                    user.role === 'ADMIN' ? 'text-gray-400' : 'text-gray-700'
                                  }`}
                                >
                                  <FaCrown className="w-3 h-3 mr-2 inline" />
                                  Quản trị viên
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {user._id === currentUser?._id && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm font-medium rounded">
                            Tài khoản của bạn
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement; 