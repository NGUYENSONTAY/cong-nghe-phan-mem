import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { categoryAPI } from '../../api/categoryAPI';
import { Category } from '../../types';

interface FilterSidebarProps {
  onFilterChange: (filters: any) => void;
  initialFilters: any;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState(initialFilters);
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery('categories', categoryAPI.getAllCategories);

  const handleFilterChange = (key: string, value: any) => {
    // Create a copy of the current filters
    const newFilters = { ...filters };

    // If the value is empty, remove the key from the filter
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    // Reset page to 1 when filters change
    newFilters.page = 1;
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = () => {
    let newFilters = { ...filters, page: 1 };
    
    if (minPrice) newFilters.minPrice = minPrice; else delete newFilters.minPrice;
    if (maxPrice) newFilters.maxPrice = maxPrice; else delete newFilters.maxPrice;
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };
  
  const clearFilters = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    setMinPrice('');
    setMaxPrice('');
    onFilterChange(clearedFilters);
  };

  return (
    <aside className="w-full lg:w-64 xl:w-72 space-y-6">
      {/* Search by Title is handled in BooksPage directly, so it can be removed from here */}

      {/* Categories */}
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-3">Danh mục</h3>
        {isLoadingCategories ? <p>Đang tải...</p> : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            <li>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={!filters.category}
                  onChange={() => handleFilterChange('category', '')}
                  className="radio radio-primary radio-sm"
                />
                <span>Tất cả</span>
              </label>
            </li>
            {categories.map((category: Category) => (
              <li key={category._id}>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={category._id}
                    checked={filters.category === category._id}
                    onChange={() => handleFilterChange('category', category._id)}
                    className="radio radio-primary radio-sm"
                  />
                  <span>{category.name}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price */}
      <div className="p-4 bg-white rounded-lg shadow-sm border">
        <h3 className="font-semibold mb-3">Giá</h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="input input-bordered w-full input-sm"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="input input-bordered w-full input-sm"
          />
        </div>
        <button onClick={handlePriceChange} className="btn btn-sm btn-outline w-full mt-3">
          Áp dụng
        </button>
      </div>
      
      <button onClick={clearFilters} className="btn btn-outline btn-sm w-full">
        Xóa bộ lọc
      </button>
    </aside>
  );
};

export default FilterSidebar; 