import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, FaImage, FaEye, FaTags, FaUser, FaBook } from 'react-icons/fa';

import { adminBooksAPI } from '../../api/adminBooksAPI';
import { categoryAPI } from '../../api/categoryAPI';
import { Book, PaginatedResponse, Category } from '../../types';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { ConfirmModal } from '../../components/common/Modal';

const AdminBookManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState(searchParams.get('sortDir') || 'desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for delete confirmation modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  
  // State for bulk operations
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 12;

  // Get categories for filter dropdown
  const { data: categories } = useQuery<Category[]>('categories', categoryAPI.getAllCategories);
  
  const { data: booksResponse, isLoading, isError, error } = useQuery<PaginatedResponse<Book>, Error>(
    ['adminBooks', page, searchTerm, selectedCategory, sortBy, sortDir],
    () => adminBooksAPI.getBooks(page - 1, limit, { 
      title: searchTerm || undefined,
      categoryId: selectedCategory || undefined,
      sortBy, 
      sortDir 
    }),
    { keepPreviousData: true }
  );
  
  const deleteMutation = useMutation(adminBooksAPI.deleteBook, {
    onSuccess: () => {
      toast.success('Xóa sách thành công!');
      queryClient.invalidateQueries('adminBooks');
      closeDeleteModal();
    },
    onError: (err: Error) => {
      toast.error(`Lỗi khi xóa sách: ${err.message}`);
      closeDeleteModal();
    }
  });

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const openDeleteModal = (book: Book) => {
    setBookToDelete(book);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setBookToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteBook = () => {
    if (bookToDelete) {
      deleteMutation.mutate(bookToDelete._id);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('page', '1');
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortDir !== 'desc') params.set('sortDir', sortDir);
    setSearchParams(params);
  };

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortDir !== 'desc') params.set('sortDir', sortDir);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('createdAt');
    setSortDir('desc');
    setSearchParams({});
  };

  const toggleBookSelection = (bookId: string) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const selectAllBooks = () => {
    if (booksResponse?.data) {
      setSelectedBooks(booksResponse.data.map(book => book._id));
    }
  };

  const clearSelection = () => {
    setSelectedBooks([]);
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { text: 'Hết hàng', color: 'text-red-600 bg-red-50' };
    if (quantity < 10) return { text: 'Sắp hết', color: 'text-yellow-600 bg-yellow-50' };
    return { text: 'Còn hàng', color: 'text-green-600 bg-green-50' };
  };

  const renderContent = () => {
    if (isLoading) return <Loading text="Đang tải danh sách sách..." />;
    if (isError) return <div className="text-red-500">Lỗi: {error?.message}</div>;
    if (!booksResponse?.data || booksResponse.data.length === 0) {
      return (
        <div className="text-center py-12">
          <FaBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không có sách nào</h3>
          <p className="text-gray-500 mb-6">Bắt đầu bằng cách thêm sách mới vào hệ thống.</p>
          <Link
            to="/admin/books/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Thêm sách mới
          </Link>
        </div>
      );
    }

    return (
      <>
        {/* Bulk Actions */}
        {selectedBooks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Đã chọn {selectedBooks.length} sách
              </span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  Xóa được chọn
                </button>
                <button 
                  onClick={clearSelection}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {booksResponse.data.map((book) => {
            const stockStatus = getStockStatus(book.quantity);
            return (
              <div key={book._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book._id)}
                    onChange={() => toggleBookSelection(book._id)}
                    className="absolute top-2 left-2 z-10"
                  />
                  <img
                    src={book.images?.[0] || '/placeholder-book.jpg'}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${stockStatus.color}`}>
                    {stockStatus.text}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <FaUser className="w-3 h-3 mr-1" />
                    {book.author}
                  </p>
                  <p className="text-sm text-gray-600 mb-2 flex items-center">
                    <FaTags className="w-3 h-3 mr-1" />
                    {book.category?.name || 'Chưa phân loại'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(book.price)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Kho: {book.quantity}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/books/${book._id}`}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 flex items-center justify-center"
                    >
                      <FaEye className="w-3 h-3 mr-1" />
                      Xem
                    </Link>
                    <Link
                      to={`/admin/books/edit/${book._id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 flex items-center justify-center"
                    >
                      <FaEdit className="w-3 h-3 mr-1" />
                      Sửa
                    </Link>
                    <button
                      onClick={() => openDeleteModal(book)}
                      className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 flex items-center justify-center"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sách</h1>
          <p className="text-gray-600 mt-1">
            {booksResponse ? `${booksResponse.totalItems.toLocaleString()} sách` : 'Đang tải...'}
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
          <Link
            to="/admin/books/new"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 flex items-center"
          >
            <FaPlus className="w-4 h-4 mr-2" />
            Thêm sách mới
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên sách, tác giả..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp theo</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Ngày tạo</option>
                  <option value="title">Tên sách</option>
                  <option value="price">Giá</option>
                  <option value="quantity">Số lượng</option>
                  <option value="sold">Đã bán</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                <select
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">Giảm dần</option>
                  <option value="asc">Tăng dần</option>
                </select>
              </div>

              <div className="flex items-end space-x-2">
                <button
                  type="button"
                  onClick={handleFilterChange}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700"
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

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{booksResponse?.totalItems || 0}</div>
              <div className="text-sm text-gray-500">Tổng sách</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {booksResponse?.data?.filter(book => book.quantity > 0).length || 0}
              </div>
              <div className="text-sm text-gray-500">Còn hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {booksResponse?.data?.filter(book => book.quantity === 0).length || 0}
              </div>
              <div className="text-sm text-gray-500">Hết hàng</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {booksResponse?.data?.filter(book => book.quantity > 0 && book.quantity < 10).length || 0}
              </div>
              <div className="text-sm text-gray-500">Sắp hết</div>
            </div>
          </div>
        </div>

        {/* Bulk Selection */}
        {booksResponse?.data && booksResponse.data.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={selectAllBooks}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Chọn tất cả trang này
              </button>
              {selectedBooks.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Hiển thị {booksResponse.data.length} trên {booksResponse.totalItems} sách
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Pagination */}
      {booksResponse && booksResponse.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={booksResponse.currentPage + 1}
            totalPages={booksResponse.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <ConfirmModal
          isOpen={isModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteBook}
          title="Xác nhận xóa sách"
          message={`Bạn có chắc chắn muốn xóa sách "${bookToDelete.title}"? Hành động này không thể hoàn tác.`}
          variant="danger"
          confirmText="Xóa"
        />
      )}
    </div>
  );
};

export default AdminBookManagement; 