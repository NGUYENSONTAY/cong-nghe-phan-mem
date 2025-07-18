import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaUser, FaSave, FaTimes, FaCalendar, FaGlobe, FaBook } from 'react-icons/fa';

import { adminAuthorsAPI, Author, CreateAuthorData } from '../../api/adminAuthorsAPI';
import Loading from '../../components/common/Loading';
import { ConfirmModal } from '../../components/common/Modal';

interface AuthorFormData extends CreateAuthorData {
  id?: string;
}

const AdminAuthorManagement: React.FC = () => {
  const queryClient = useQueryClient();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNationality, setSelectedNationality] = useState('');
  
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
  
  // State for add/edit modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState<AuthorFormData>({
    name: '',
    bio: '',
    birthDate: '',
    nationality: '',
  });

  const { data: authors, isLoading, isError, error } = useQuery<Author[]>(
    'authors',
    adminAuthorsAPI.getAllAuthors
  );

  const { data: nationalities } = useQuery<string[]>(
    'nationalities',
    adminAuthorsAPI.getNationalities
  );

  const createMutation = useMutation(adminAuthorsAPI.createAuthor, {
    onSuccess: () => {
      toast.success('Tạo tác giả thành công!');
      queryClient.invalidateQueries('authors');
      closeFormModal();
    },
    onError: (err: Error) => {
      toast.error(`Lỗi khi tạo tác giả: ${err.message}`);
    }
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: CreateAuthorData }) => adminAuthorsAPI.updateAuthor(id, data),
    {
      onSuccess: () => {
        toast.success('Cập nhật tác giả thành công!');
        queryClient.invalidateQueries('authors');
        closeFormModal();
      },
      onError: (err: Error) => {
        toast.error(`Lỗi khi cập nhật tác giả: ${err.message}`);
      }
    }
  );

  const deleteMutation = useMutation(adminAuthorsAPI.deleteAuthor, {
    onSuccess: () => {
      toast.success('Xóa tác giả thành công!');
      queryClient.invalidateQueries('authors');
      closeDeleteModal();
    },
    onError: (err: Error) => {
      toast.error(`Lỗi khi xóa tác giả: ${err.message}`);
      closeDeleteModal();
    }
  });

  const filteredAuthors = authors?.filter(author => {
    const matchesSearch = author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         author.nationality?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNationality = !selectedNationality || author.nationality === selectedNationality;
    
    return matchesSearch && matchesNationality;
  }) || [];

  const openCreateModal = () => {
    setEditingAuthor(null);
    setFormData({ name: '', bio: '', birthDate: '', nationality: '' });
    setIsFormModalOpen(true);
  };

  const openEditModal = (author: Author) => {
    setEditingAuthor(author);
    setFormData({
      id: author.id,
      name: author.name,
      bio: author.bio || '',
      birthDate: author.birthDate || '',
      nationality: author.nationality || '',
    });
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAuthor(null);
    setFormData({ name: '', bio: '', birthDate: '', nationality: '' });
  };

  const openDeleteModal = (author: Author) => {
    setAuthorToDelete(author);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setAuthorToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Tên tác giả không được để trống');
      return;
    }

    const authorData: CreateAuthorData = {
      name: formData.name.trim(),
      bio: formData.bio?.trim() || '',
      birthDate: formData.birthDate || '',
      nationality: formData.nationality?.trim() || '',
    };

    if (editingAuthor) {
      updateMutation.mutate({ id: editingAuthor.id, data: authorData });
    } else {
      createMutation.mutate(authorData);
    }
  };

  const handleDeleteAuthor = () => {
    if (authorToDelete) {
      deleteMutation.mutate(authorToDelete.id);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  if (isLoading) return <Loading text="Đang tải danh sách tác giả..." />;
  if (isError) return <div className="text-red-500">Lỗi: {(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Tác giả</h1>
          <p className="text-gray-600 mt-1">
            {authors ? `${authors.length} tác giả` : 'Đang tải...'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 flex items-center"
        >
          <FaPlus className="w-4 h-4 mr-2" />
          Thêm tác giả mới
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm tác giả theo tên, tiểu sử, quốc tịch..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Nationality Filter */}
          <div>
            <select
              value={selectedNationality}
              onChange={(e) => setSelectedNationality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tất cả quốc tịch</option>
              {nationalities?.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {authors?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Tổng tác giả</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{filteredAuthors.length}</div>
            <div className="text-sm text-gray-500">Hiển thị</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{nationalities?.length || 0}</div>
            <div className="text-sm text-gray-500">Quốc tịch</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {authors?.length || 0}
            </div>
            <div className="text-sm text-gray-500">Tổng sách</div>
          </div>
        </div>
      </div>

      {/* Authors List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredAuthors.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedNationality ? 'Không tìm thấy tác giả' : 'Chưa có tác giả nào'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedNationality ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc' : 'Bắt đầu bằng cách thêm tác giả mới'}
            </p>
            {!searchTerm && !selectedNationality && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Thêm tác giả mới
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông tin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiểu sử
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sách
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAuthors.map((author) => (
                  <tr key={author.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{author.name}</div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <FaGlobe className="w-3 h-3 mr-1" />
                            {author.nationality || 'Chưa rõ'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {author.birthDate && (
                          <div className="flex items-center mb-1">
                            <FaCalendar className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{formatDate(author.birthDate)}</span>
                            {calculateAge(author.birthDate) && (
                              <span className="ml-2 text-gray-500">({calculateAge(author.birthDate)} tuổi)</span>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Tạo: {formatDateTime(author.createdAt || '')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {author.bio ? (
                          <div className="truncate">{author.bio}</div>
                        ) : (
                          <span className="text-gray-400 italic">Chưa có tiểu sử</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaBook className="w-4 h-4 mr-1 text-green-600" />
                        <span className="font-medium">0</span>
                        <span className="text-gray-500 ml-1">cuốn</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => openEditModal(author)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center"
                        >
                          <FaEdit className="w-3 h-3 mr-1" />
                          Sửa
                        </button>
                        <button
                          onClick={() => openDeleteModal(author)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingAuthor ? 'Chỉnh sửa tác giả' : 'Thêm tác giả mới'}
                </h3>
                <button
                  onClick={closeFormModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên tác giả *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên tác giả..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quốc tịch
                    </label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập quốc tịch..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiểu sử
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tiểu sử tác giả..."
                    rows={4}
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
      {authorToDelete && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteAuthor}
          title="Xác nhận xóa tác giả"
          message={`Bạn có chắc chắn muốn xóa tác giả "${authorToDelete.name}"? Hành động này không thể hoàn tác và có thể ảnh hưởng đến các sách của tác giả này.`}
          variant="danger"
          confirmText="Xóa"
        />
      )}
    </div>
  );
};

export default AdminAuthorManagement;