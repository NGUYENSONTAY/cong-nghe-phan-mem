import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBook, FaSave, FaTimes } from 'react-icons/fa';

import { categoryAPI, CategoryData } from '../../api/categoryAPI';
import { Category } from '../../types';
import Loading from '../../components/common/Loading';
import { ConfirmModal } from '../../components/common/Modal';

interface CategoryFormData extends CategoryData {
  _id?: string;
}

const AdminCategoryManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  
  // State for add/edit modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });

  const { data: categories, isLoading, isError, error } = useQuery<Category[]>(
    'categories',
    categoryAPI.getAllCategories
  );

  const createMutation = useMutation(categoryAPI.createCategory, {
    onSuccess: () => {
      toast.success('Tạo danh mục thành công!');
      queryClient.invalidateQueries('categories');
      closeFormModal();
    },
    onError: (err: Error) => {
      toast.error(`Lỗi khi tạo danh mục: ${err.message}`);
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: CategoryData }) => categoryAPI.updateCategory(id, data),
    {
      onSuccess: () => {
        toast.success('Cập nhật danh mục thành công!');
        queryClient.invalidateQueries('categories');
        closeFormModal();
      },
      onError: (err: Error) => {
        toast.error(`Lỗi khi cập nhật danh mục: ${err.message}`);
      }
    }
  );

  const deleteMutation = useMutation(categoryAPI.deleteCategory, {
    onSuccess: () => {
      toast.success('Xóa danh mục thành công!');
      queryClient.invalidateQueries('categories');
      closeDeleteModal();
    },
    onError: (err: Error) => {
      toast.error(`Lỗi khi xóa danh mục: ${err.message}`);
      closeDeleteModal();
    }
  });

  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      _id: category._id,
      name: category.name,
      description: category.description || '',
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setCategoryToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Tên danh mục không được để trống');
      return;
    }

    const categoryData: CategoryData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: categoryData });
    } else {
      createMutation.mutate(categoryData);
    }
  };

  const handleDeleteCategory = () => {
    if (categoryToDelete) {
      deleteMutation.mutate(categoryToDelete._id);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (isLoading) return <Loading text="Đang tải danh sách danh mục..." />;
  if (isError) return <div className="text-red-500">Lỗi: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-600 mt-1">
            {categories ? `${categories.length} danh mục` : 'Đang tải...'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Thêm danh mục mới
        </button>
      </div>

      {/* Search and Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm danh mục..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{categories?.length || 0}</div>
            <div className="text-sm text-gray-500">Tổng danh mục</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredCategories.length}</div>
            <div className="text-sm text-gray-500">Hiển thị</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">Sách/danh mục (TB)</div>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <FaBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Thử thay đổi từ khóa tìm kiếm' : 'Bắt đầu bằng cách thêm danh mục mới'}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Thêm danh mục mới
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
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
                {filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {category.description || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {category.createdAt ? formatDateTime(category.createdAt) : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center"
                        >
                          <FaEdit className="w-3 h-3 mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(category)}
                          className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 flex items-center"
                        >
                          <FaTrash className="w-3 h-3 mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                </h3>
                <button
                  onClick={closeFormModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên danh mục..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập mô tả danh mục..."
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={createMutation.isLoading || updateMutation.isLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    {createMutation.isLoading || updateMutation.isLoading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 flex items-center justify-center"
                  >
                    <FaTimes className="w-4 h-4 mr-2" />
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteCategory}
          title="Xác nhận xóa danh mục"
          message={`Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete.name}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sách thuộc danh mục này.`}
          variant="danger"
          confirmText="Xóa"
        />
      )}
    </div>
  );
};

export default AdminCategoryManagement; 