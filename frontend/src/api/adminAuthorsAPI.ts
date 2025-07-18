import { api } from './api';

export interface Author {
  id: string;
  name: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  booksCount?: number;
}

export interface PaginatedAuthors {
  content: Author[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface CreateAuthorData {
  name: string;
  bio?: string;
  birthDate?: string;
  nationality?: string;
  imageUrl?: string;
}

export const adminAuthorsAPI = {
  // Get all authors with pagination
  getAuthors: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = 'id',
    sortDir: string = 'desc',
    filter?: {
      name?: string;
      nationality?: string;
    }
  ): Promise<PaginatedAuthors> => {
    const params: any = {
      page,
      size,
      sortBy,
      sortDir,
      ...filter
    };
    
    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === '') {
        delete params[key];
      }
    });

    console.log('📤 Fetching admin authors with params:', params);
    
    const response = await api.get('/admin/authors', { params });
    const data = response.data;
    
    console.log('📥 Admin authors response:', data);
    
    return data;
  },

  // Get all authors (simple list)
  getAllAuthors: async (): Promise<Author[]> => {
    const response = await api.get('/authors');
    return response.data;
  },

  // Get author by ID
  getAuthor: async (id: string): Promise<Author> => {
    const response = await api.get(`/admin/authors/${id}`);
    return response.data;
  },

  // Create new author
  createAuthor: async (authorData: CreateAuthorData): Promise<Author> => {
    console.log('📚 Creating author with data:', authorData);
    
    try {
      const response = await api.post('/admin/authors', authorData);
      console.log('✅ Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Create author error:', error);
      throw error;
    }
  },

  // Update author
  updateAuthor: async (id: string, authorData: Partial<CreateAuthorData>): Promise<Author> => {
    console.log('📚 Updating author with data:', authorData);
    
    try {
      const response = await api.put(`/admin/authors/${id}`, authorData);
      console.log('✅ Backend update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Update author error:', error);
      throw error;
    }
  },

  // Delete author
  deleteAuthor: async (id: string): Promise<void> => {
    console.log('🗑️ Deleting author with ID:', id);
    
    try {
      await api.delete(`/admin/authors/${id}`);
      console.log('✅ Author deleted successfully');
    } catch (error) {
      console.error('❌ Delete author error:', error);
      throw error;
    }
  },

  // Bulk delete authors
  bulkDeleteAuthors: async (ids: string[]): Promise<void> => {
    await api.post('/admin/authors/bulk-delete', { ids });
  },

  // Get author statistics
  getAuthorStatistics: async (): Promise<{
    totalAuthors: number;
    authorsWithBooks: number;
    authorsWithoutBooks: number;
  }> => {
    const response = await api.get('/admin/authors/statistics');
    return response.data;
  },

  // Search authors by name
  searchAuthors: async (query: string): Promise<Author[]> => {
    const response = await api.get('/authors/search', {
      params: { q: query }
    });
    return response.data;
  },

  // Get all unique nationalities
  getNationalities: async (): Promise<string[]> => {
    const response = await api.get('/admin/authors/nationalities');
    return response.data;
  },
};
