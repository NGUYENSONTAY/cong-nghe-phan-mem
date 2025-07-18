import { api } from './api';
import { Category } from '../types';

export type CategoryData = {
  name: string;
  description?: string;
};

const adaptCategory = (c: any): Category => ({
  _id: c._id ?? c.id ?? '',
  name: c.name,
  description: c.description ?? '',
  createdAt: c.createdAt ?? '',
  updatedAt: c.updatedAt ?? '',
});

const adaptCategories = (arr: any[]): Category[] => arr.map(adaptCategory);

export const categoryAPI = {
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return adaptCategories(response.data);
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return adaptCategory(response.data);
  },

  createCategory: async (data: CategoryData): Promise<Category> => {
    const response = await api.post('/categories', data);
    return adaptCategory(response.data);
  },

  updateCategory: async (id: string, data: CategoryData): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return adaptCategory(response.data);
  },

  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
}; 