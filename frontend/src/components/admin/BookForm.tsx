import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useQuery } from 'react-query';
import { categoryAPI } from '../../api/categoryAPI';
import { authorAPI } from '../../api/authorAPI';
import { uploadAPI } from '../../api/uploadAPI';
import { Book } from '../../types';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

interface BookFormProps {
  onSubmit: (data: BookFormData) => Promise<void>;
  initialData?: Book;
  isSubmitting: boolean;
  submitButtonText?: string;
}

export interface BookFormData {
  title: string;
  authorId: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  images: string[];
}

const schema = yup.object().shape({
  title: yup.string().min(1, 'Tên sách ít nhất 1 ký tự').required('Tên sách là bắt buộc'),
  authorId: yup.string().required('Tác giả là bắt buộc'),
  description: yup.string().min(1, 'Mô tả ít nhất 1 ký tự').required('Mô tả là bắt buộc'),
  price: yup
    .number()
    .typeError('Giá phải là một con số')
    .positive('Giá phải là số dương')
    .required('Giá là bắt buộc'),
  quantity: yup
    .number()
    .typeError('Số lượng phải là một con số')
    .integer('Số lượng phải là số nguyên')
    .min(0, 'Số lượng không được âm')
    .required('Số lượng là bắt buộc'),
  category: yup.string().required('Danh mục là bắt buộc'),
  images: yup
    .array()
    .of(yup.string().required('URL ảnh là bắt buộc'))
    .min(1, 'Cần ít nhất một hình ảnh')
    .required('Hình ảnh là bắt buộc'),
});

const BookForm: React.FC<BookFormProps> = ({
  onSubmit,
  initialData,
  isSubmitting,
  submitButtonText = 'Lưu',
}) => {
  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useQuery('categories', categoryAPI.getAllCategories);

  const {
    data: authors,
    isLoading: isLoadingAuthors,
    error: authorsError,
  } = useQuery('authors', authorAPI.getAllAuthors);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BookFormData>({
    // resolver: yupResolver(schema), // Temporarily disable validation
    defaultValues: {
      images: [],
    },
  });

  const imagesValue = useWatch({ control, name: 'images' });

  useEffect(() => {
    if (initialData && authors) {
      // Find authorId from author name
      const authorId = authors.find(author => author.name === initialData.author)?._id || '';
      
      console.log('🔄 Setting initial data:', {
        ...initialData,
        category: initialData.category._id,
        authorId: authorId,
        foundAuthor: authors.find(author => author.name === initialData.author)
      });
      
      reset({
        ...initialData,
        category: initialData.category._id,
        authorId: authorId,
      });
    }
  }, [initialData, authors, reset]);

  const handleFormSubmit = (data: BookFormData) => {
    console.log('🔥 Form submitted with data:', data);
    console.log('🔍 Form validation errors:', errors);
    console.log('📋 isSubmitting state:', isSubmitting);
    
    try {
      onSubmit(data);
    } catch (error) {
      console.error('🚨 Error in handleFormSubmit:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input changed:', e.target.files?.length);
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      const validation = uploadAPI.validateFile(file);
      if (!validation.isValid) {
        toast.error(String(validation.error || 'File không hợp lệ'));
        continue;
      }
      try {
        toast.loading('Đang tải ảnh lên...', { id: 'upload' });
        const url = await uploadAPI.uploadImage(file);
        const current = getValues('images') || [];
        setValue('images', [...current, url]);
        toast.success('Tải ảnh thành công', { id: 'upload' });
        console.log('✅ Image uploaded:', url);
      } catch (err: any) {
        const msg = (err && typeof err === 'object' && 'message' in err) ? (err as any).message : 'Lỗi tải ảnh';
        toast.error(String(msg), { id: 'upload' });
        console.error('❌ Image upload error:', err);
      }
    }
    e.target.value = '';
  };

  if (isLoadingCategories || isLoadingAuthors) return <Loading />;
  if (categoriesError || authorsError) return <p className="text-red-500">Lỗi khi tải danh mục hoặc tác giả.</p>;

  return (
    <form 
      onSubmit={(e) => {
        console.log('📝 Form onSubmit triggered!');
        console.log('📋 Form data before handleSubmit:', getValues());
        console.log('🔍 Current validation errors:', errors);
        console.log('📊 Form validation state:', {
          isValid: Object.keys(errors).length === 0,
          errorCount: Object.keys(errors).length,
          errors: errors
        });
        
        // Prevent default and call handleSubmit manually to debug
        e.preventDefault();
        
        const formData = getValues();
        console.log('📋 About to validate and submit:', formData);
        
        // Call handleSubmit manually with better error handling
        handleSubmit(
          (data) => {
            console.log('✅ Validation passed, calling handleFormSubmit with:', data);
            handleFormSubmit(data);
          },
          (errors) => {
            console.error('❌ Validation failed with errors:', errors);
          }
        )(e);
      }} 
      className="space-y-6 bg-white p-8 rounded-lg shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Tên sách</label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700">Tác giả</label>
          <select
            id="author"
            {...register('authorId')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.authorId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="">Chọn tác giả</option>
            {authors?.map((author) => (
              <option key={author._id} value={author._id}>{author.name}</option>
            ))}
          </select>
          {errors.authorId && <p className="mt-2 text-sm text-red-600">{errors.authorId.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Mô tả</label>
        <textarea
          id="description"
          rows={4}
          {...register('description')}
          className={`mt-1 block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        />
        {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Giá</label>
          <input
            id="price"
            type="number"
            {...register('price')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.price && <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Số lượng</label>
          <input
            id="quantity"
            type="number"
            {...register('quantity')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.quantity ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          />
          {errors.quantity && <p className="mt-2 text-sm text-red-600">{errors.quantity.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Danh mục</label>
          <select
            id="category"
            {...register('category')}
            className={`mt-1 block w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          >
            <option value="">Chọn danh mục</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>}
        </div>
      </div>
      
      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hình ảnh sách
        </label>
        
        {/* Upload Button */}
        <div className="mb-4">
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            id="fileInput" 
            onChange={handleFileChange} 
          />
          <label 
            htmlFor="fileInput" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tải ảnh lên
          </label>
          {imagesValue && imagesValue.length > 0 && (
            <span className="ml-3 text-sm text-gray-600">
              Đã có {imagesValue.length} ảnh
            </span>
          )}
        </div>

        {/* Image Preview */}
        {imagesValue && imagesValue.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {imagesValue.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/300x400?text=No+Image';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const current = getValues('images') || [];
                    setValue('images', current.filter((_, i) => i !== index));
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images.message}</p>}
      </div>


      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          onClick={() => console.log('🖱️ Submit button clicked!')}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isSubmitting ? 'Đang xử lý...' : submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default BookForm; 