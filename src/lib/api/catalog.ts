import apiClient from './client';
import type { Catalog, ScheduleSlot } from '@/types/domain';

export interface CatalogCreateInput {
  category_id: string;
  title: string;
  description?: string;
  type: string;
  price: number;
  duration?: number;
  quota?: number;
  status?: string;
  requirements?: string;
  slots?: {
    start_time: string;
    end_time: string;
    capacity: number;
  }[];
}

export interface CatalogUpdateInput {
  category_id?: string;
  title?: string;
  description?: string;
  price?: number;
  duration?: number;
  quota?: number;
  status?: string;
  requirements?: string;
}

export interface ScheduleSlotInput {
  start_time: string;
  end_time: string;
  capacity: number;
}

export async function getMyCatalogs(params?: { status?: string; type?: string }): Promise<Catalog[]> {
  const res = await apiClient.get('/catalogs/me', { params });
  return res.data?.data || [];
}

export async function getCatalog(id: string): Promise<Catalog> {
  const res = await apiClient.get(`/catalogs/${id}`);
  return res.data?.data;
}

export async function createCatalog(data: CatalogCreateInput): Promise<Catalog> {
  const res = await apiClient.post('/catalogs', data);
  return res.data?.data;
}

export async function updateCatalog(id: string, data: CatalogUpdateInput): Promise<Catalog> {
  const res = await apiClient.put(`/catalogs/${id}`, data);
  return res.data?.data;
}

export async function deleteCatalog(id: string): Promise<void> {
  await apiClient.delete(`/catalogs/${id}`);
}

export async function addScheduleSlot(catalogId: string, slot: ScheduleSlotInput): Promise<ScheduleSlot> {
  const res = await apiClient.post(`/catalogs/${catalogId}/schedule-slots`, slot);
  return res.data?.data;
}

export async function getAdminCatalogs(params?: {
  status?: string;
  category_id?: string;
  talent_profile_id?: string;
  page?: number;
  per_page?: number;
  sort?: string;
}): Promise<Catalog[]> {
  const res = await apiClient.get('/catalogs', { params });
  return res.data?.data || [];
}

export async function moderateCatalogStatus(
  id: string,
  status: 'published' | 'active' | 'rejected' | 'archived' | 'draft'
): Promise<Catalog> {
  const normalizedStatus = status === 'active' ? 'published' : status;
  const res = await apiClient.put(`/catalogs/${id}`, { status: normalizedStatus });
  return res.data?.data;
}
