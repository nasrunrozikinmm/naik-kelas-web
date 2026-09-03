import apiClient from './client';
import type { Category } from '@/types/domain';

export interface CategoryCreateInput {
  name: string;
  slug: string;
  parent_id?: string;
  status?: string;
}

export interface CategoryUpdateInput {
  name?: string;
  slug?: string;
  parent_id?: string;
  status?: string;
}

export async function getCategories(params?: { status?: string }): Promise<Category[]> {
  const res = await apiClient.get('/categories', { params });
  return res.data?.data || [];
}

export async function getCategory(id: string): Promise<Category> {
  const res = await apiClient.get(`/categories/${id}`);
  return res.data?.data;
}

export async function createCategory(data: CategoryCreateInput): Promise<Category> {
  const res = await apiClient.post('/categories', data);
  return res.data?.data;
}

export async function updateCategory(id: string, data: CategoryUpdateInput): Promise<Category> {
  const res = await apiClient.put(`/categories/${id}`, data);
  return res.data?.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}
