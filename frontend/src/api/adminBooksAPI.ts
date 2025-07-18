import { api } from './api';
import { Book, PaginatedResponse } from '../types';
import { BookFormData } from '../components/admin/BookForm';

// Adapter: convert backend Book -> frontend Book
const adaptBook = (b: any): Book => ({
  _id: b.id ?? b._id ?? '',
  title: b.title,
  author: (typeof b.author === 'string') ? b.author : b.author?.name ?? '',
  description: b.description ?? '',
  price: Number(b.price ?? 0),
  quantity: b.stockQuantity ?? b.quantity ?? 0,
  category: {
    _id: b.category?.id ?? b.category?._id ?? '',
    name: b.category?.name ?? '',
    description: b.category?.description ?? '',
    createdAt: b.category?.createdAt ?? '',
    updatedAt: b.category?.updatedAt ?? '',
  },
  images: b.images ?? (b.imageUrl ? [b.imageUrl] : []),
  createdAt: b.createdAt ?? '',
  updatedAt: b.updatedAt ?? '',
});

const adaptBooks = (arr: any[]): Book[] => arr.map(adaptBook);

export const adminBooksAPI = {
  // Get books with admin endpoint
  getBooks: async (
    page: number,
    limit: number,
    filter: {
      title?: string;
      author?: string;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
      sortBy?: string;
      sortDir?: string;
    }
  ): Promise<PaginatedResponse<Book>> => {
    const params: any = {
      page,
      size: limit,
      ...filter
    };
    
    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    console.log('📤 Fetching admin books with params:', params);
    
    const response = await api.get('/admin/books', { params });
    const backendData = response.data;
    
    console.log('📥 Admin books response:', backendData);
    
    // Adapt backend Spring Boot pagination format to frontend format
    return {
      data: adaptBooks(backendData.content || []),
      totalItems: backendData.totalElements || 0,
      totalPages: backendData.totalPages || 0,
      currentPage: backendData.number || 0,
    };
  },

  // Get single book by ID
  getBook: async (id: string): Promise<Book> => {
    const response = await api.get(`/admin/books/${id}`);
    return adaptBook(response.data);
  },

  // Create new book
  createBook: async (bookData: BookFormData): Promise<Book> => {
    console.log('📚 Creating book with data:', bookData);
    
    // Transform frontend data to backend format
    const backendData = {
      title: bookData.title,
      description: bookData.description,
      price: bookData.price,
      stockQuantity: bookData.quantity, // quantity -> stockQuantity
      categoryId: bookData.category, // category -> categoryId
      authorId: bookData.authorId, // Use authorId instead of author name
      images: bookData.images || [],
    };
    
    console.log('📤 Sending to backend:', backendData);
    
    try {
      const response = await api.post('/admin/books', backendData);
      console.log('✅ Backend response:', response.data);
      return adaptBook(response.data);
    } catch (error) {
      console.error('❌ Create book error:', error);
      throw error;
    }
  },

  // Update book
  updateBook: async (id: string, bookData: BookFormData): Promise<Book> => {
    console.log('📚 Updating book with data:', bookData);
    
    // Transform frontend data to backend format
    const backendData = {
      title: bookData.title,
      description: bookData.description,
      price: bookData.price,
      stockQuantity: bookData.quantity, // quantity -> stockQuantity
      categoryId: bookData.category, // category -> categoryId
      authorId: bookData.authorId, // Use authorId instead of author name
      images: bookData.images || [],
    };
    
    console.log('📤 Sending update to backend:', backendData);
    
    try {
      const response = await api.put(`/admin/books/${id}`, backendData);
      console.log('✅ Backend update response:', response.data);
      return adaptBook(response.data);
    } catch (error) {
      console.error('❌ Update book error:', error);
      throw error;
    }
  },

  // Delete book
  deleteBook: async (id: string): Promise<void> => {
    await api.delete(`/admin/books/${id}`);
  },

  // Bulk delete books
  bulkDeleteBooks: async (ids: string[]): Promise<void> => {
    await api.post('/admin/books/bulk-delete', { ids });
  },
};
