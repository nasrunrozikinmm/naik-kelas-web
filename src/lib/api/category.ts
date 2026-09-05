import apiClient from './client';
import type { Category, PaginatedResult } from '@/types/domain';

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

export async function getCategories(params?: {
  status?: string;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<Category[]> {
  const res = await apiClient.get('/categories', { params });
  return res.data?.data || [];
}

export const getAllCategories = getCategories;

export async function getPaginatedCategories(params?: {
  status?: string;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResult<Category>> {
  const res = await apiClient.get('/categories', { params });
  const data = res.data?.data;
  const items = Array.isArray(data) ? data : [];
  return {
    items,
    total: res.data?.meta?.total ?? items.length,
    page: res.data?.meta?.page ?? (params?.page || 1),
    per_page: res.data?.meta?.per_page ?? (params?.per_page || 20),
    total_pages: res.data?.meta?.total_pages ?? 1,
  };
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
