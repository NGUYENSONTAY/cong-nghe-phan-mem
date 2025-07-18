import { api } from './api';

export interface Author {
  _id: string;
  name: string;
  biography?: string;
  birthDate?: string;
  nationality?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorData {
  name: string;
  biography?: string;
  birthDate?: string;
  nationality?: string;
}

export const authorAPI = {
  getAllAuthors: async (): Promise<Author[]> => {
    const response = await api.get('/authors');
    return response.data.map((author: any) => ({
      _id: author.id.toString(),
      name: author.name,
      biography: author.biography,
      birthDate: author.birthDate,
      nationality: author.nationality,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    }));
  },

  getAuthorById: async (id: string): Promise<Author> => {
    const response = await api.get(`/authors/${id}`);
    const author = response.data;
    return {
      _id: author.id.toString(),
      name: author.name,
      biography: author.biography,
      birthDate: author.birthDate,
      nationality: author.nationality,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  },

  createAuthor: async (authorData: AuthorData): Promise<Author> => {
    const response = await api.post('/authors', authorData);
    const author = response.data;
    return {
      _id: author.id.toString(),
      name: author.name,
      biography: author.biography,
      birthDate: author.birthDate,
      nationality: author.nationality,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  },

  updateAuthor: async (id: string, authorData: AuthorData): Promise<Author> => {
    const response = await api.put(`/authors/${id}`, authorData);
    const author = response.data;
    return {
      _id: author.id.toString(),
      name: author.name,
      biography: author.biography,
      birthDate: author.birthDate,
      nationality: author.nationality,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt,
    };
  },

  deleteAuthor: async (id: string): Promise<void> => {
    await api.delete(`/authors/${id}`);
  },

  getAllNationalities: async (): Promise<string[]> => {
    const response = await api.get('/authors/nationalities');
    return response.data;
  },
}; 