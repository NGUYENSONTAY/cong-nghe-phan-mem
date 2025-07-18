import { api } from './api';
import { Book, PaginatedResponse } from '../types';
import { BookFormData } from '../components/admin/BookForm';

// Adapter: convert backend Book -> frontend Book
const adaptBook = (b: any): Book => ({
  _id: b.id ?? b._id ?? '',
  title: b.title,
  author: (typeof b.author === 'string') ? b.author : (b.author?.name ?? b.authorName ?? ''),
  description: b.description ?? '',
  price: Number(b.price ?? 0),
  quantity: b.stockQuantity ?? b.quantity ?? 0,
  category: {
    _id: b.category?.id ?? b.category?._id ?? b.categoryId ?? '',
    name: b.category?.name ?? b.categoryName ?? '',
    description: b.category?.description ?? '',
    createdAt: b.category?.createdAt ?? '',
    updatedAt: b.category?.updatedAt ?? '',
  },
  images: b.images ?? (b.imageUrl ? [b.imageUrl] : []),
  createdAt: b.createdAt ?? '',
  updatedAt: b.updatedAt ?? '',
});

const adaptBooks = (arr: any[]): Book[] => arr.map(adaptBook);

export const booksAPI = {
  getBooks: async (
    page: number,
    limit: number,
    filter: {
      title?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
      sortDir?: string;
    }
  ): Promise<PaginatedResponse<Book>> => {
    const response = await api.get('/books', { params: { page, limit, ...filter } });
    const backendData = response.data;
    
    // Adapt backend Spring Boot pagination format to frontend format
    return {
      data: adaptBooks(backendData.content || []),
      totalItems: backendData.totalElements || 0,
      totalPages: backendData.totalPages || 0,
      currentPage: backendData.number || 0,
    };
  },

  getBookById: async (id: string): Promise<Book> => {
    const response = await api.get(`/books/${id}`);
    return adaptBook(response.data);
  },

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
      images: bookData.images,
    };
    
    console.log('📤 Sending to backend:', backendData);
    
    try {
      const response = await api.post('/books', backendData);
      console.log('✅ Backend response:', response.data);
      return adaptBook(response.data);
    } catch (error) {
      console.error('❌ Create book error:', error);
      throw error;
    }
  },

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
      images: bookData.images,
    };
    
    console.log('📤 Sending update to backend:', backendData);
    
    try {
      const response = await api.put(`/books/${id}`, backendData);
      console.log('✅ Backend update response:', response.data);
      return adaptBook(response.data);
    } catch (error) {
      console.error('❌ Update book error:', error);
      throw error;
    }
  },

  deleteBook: async (id: string): Promise<void> => {
    await api.delete(`/books/${id}`);
  },

  getLatestBooks: async (limit: number = 8): Promise<Book[]> => {
    const response = await api.get('/books/latest', { params: { limit } });
    return adaptBooks(response.data);
  },

  getBestSellers: async (limit: number = 4): Promise<Book[]> => {
    const response = await api.get('/books/bestsellers', { params: { limit } });
    return adaptBooks(response.data);
  },
}; 