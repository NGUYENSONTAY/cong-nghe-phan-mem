import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Book, PaginatedResponse } from '../types';
import { booksAPI } from '../api/booksAPI';
import BookCard from '../components/common/BookCard';
import Pagination from '../components/common/Pagination';
import FilterSidebar from '../components/books/FilterSidebar';
import toast from 'react-hot-toast';

interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

const sortOptions: SortOption[] = [
  { value: 'default', label: 'Mặc định', field: '_id', direction: 'asc' },
  { value: 'price_asc', label: 'Giá: Thấp đến cao', field: 'price', direction: 'asc' },
  { value: 'price_desc', label: 'Giá: Cao đến thấp', field: 'price', direction: 'desc' },
  { value: 'title_asc', label: 'Tên: A-Z', field: 'title', direction: 'asc' },
  { value: 'title_desc', label: 'Tên: Z-A', field: 'title', direction: 'desc' },
  { value: 'latest', label: 'Mới nhất', field: 'createdAt', direction: 'desc' },
];

const BooksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [booksResponse, setBooksResponse] = useState<PaginatedResponse<Book> | null>(null);
  const [loading, setLoading] = useState(true);

  const { page, limit, filters } = useMemo(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const filterParams: { [key: string]: string } = {};
    searchParams.forEach((value, key) => {
      if (key !== 'page' && key !== 'limit') {
        filterParams[key] = value;
      }
    });
    return { page, limit, filters: filterParams };
  }, [searchParams]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        // API uses 0-indexed pages, UI uses 1-indexed pages
        const apiPage = page - 1;
        const response = await booksAPI.getBooks(apiPage, limit, filters);
        setBooksResponse(response);
      } catch (error) {
        toast.error('Không thể tải danh sách sách');
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
    window.scrollTo(0, 0);
  }, [page, limit, filters]);

  const updateSearchParams = (newFilters: { [key: string]: any }) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const isFilterChange = Object.keys(newFilters).some(k => k !== 'page');
    const updatedParams = { ...currentParams, ...newFilters };

    if (isFilterChange) {
      updatedParams.page = '1';
    }

    Object.keys(updatedParams).forEach(key => {
      if (updatedParams[key] === '' || updatedParams[key] === null || updatedParams[key] === undefined) {
        delete updatedParams[key];
      }
    });
    
    setSearchParams(updatedParams);
  };
  
  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };
  
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSort = sortOptions.find(opt => opt.value === e.target.value);
    if (selectedSort && selectedSort.value !== 'default') {
      updateSearchParams({ sortBy: selectedSort.field, sortDir: selectedSort.direction });
    } else {
      const newParams = Object.fromEntries(searchParams.entries());
      delete newParams.sortBy;
      delete newParams.sortDir;
      setSearchParams(newParams);
    }
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="book-card animate-pulse">
          <div className="bg-gray-300 h-64 w-full rounded-lg"></div>
          <div className="mt-4">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const getSortValue = () => {
    const sortBy = searchParams.get('sortBy');
    const sortDir = searchParams.get('sortDir');
    if (!sortBy) return 'default';
    const option = sortOptions.find(opt => opt.field === sortBy && opt.direction === sortDir);
    return option ? option.value : 'default';
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 bg-white p-6 rounded-lg shadow-sm border">
          <h1 className="text-4xl font-bold text-gray-800">Khám Phá Sách</h1>
          <p className="text-gray-600 mt-2">Tìm kiếm và lựa chọn những cuốn sách yêu thích của bạn</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <FilterSidebar onFilterChange={updateSearchParams} initialFilters={filters} />
          
          <main className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm border">
              <p className="text-gray-600 mb-2 md:mb-0">
                Hiển thị {booksResponse?.data.length || 0} trên tổng số {booksResponse?.totalItems || 0} kết quả
              </p>
              <div className="flex items-center space-x-2">
                <label htmlFor="sort" className="text-sm font-medium">Sắp xếp:</label>
                <select id="sort" onChange={handleSortChange} value={getSortValue()} className="select select-bordered select-sm">
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              renderSkeletons()
            ) : booksResponse && booksResponse.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {booksResponse.data.map(book => (
                  <BookCard key={book._id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold">Không tìm thấy sách phù hợp</h2>
                <p className="text-gray-600 mt-2">Vui lòng thử lại với bộ lọc khác.</p>
              </div>
            )}

            {booksResponse && booksResponse.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={booksResponse.currentPage + 1}
                  totalPages={booksResponse.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default BooksPage; 