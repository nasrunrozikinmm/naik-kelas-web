import apiClient from './client';
import type { Catalog, ScheduleSlot, PaginatedResult, CatalogStats } from '@/types/domain';

export interface CatalogQueryParams {
  status?: string;
  category_id?: string;
  talent_profile_id?: string;
  type?: string;
  q?: string;
  page?: number;
  per_page?: number;
  sort?: string;
}

export async function getCatalogs(params?: CatalogQueryParams): Promise<PaginatedResult<Catalog>> {
  const res = await apiClient.get('/catalogs', { params });
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

export async function getMyCatalogs(params?: {
  status?: string;
  type?: string;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResult<Catalog>> {
  const res = await apiClient.get('/catalogs/me', { params });
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

export interface CatalogCreateInput {
  category_id: string;
  title: string;
  description?: string;
  image_url?: string;
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
  image_url?: string;
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
  type?: string;
  q?: string;
  page?: number;
  per_page?: number;
  sort?: string;
}): Promise<PaginatedResult<Catalog>> {
  const res = await apiClient.get('/catalogs', { params });
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

export async function moderateCatalogStatus(
  id: string,
  status: 'published' | 'active' | 'rejected' | 'archived' | 'draft'
): Promise<Catalog> {
  const normalizedStatus = status === 'active' ? 'published' : status;
  const res = await apiClient.put(`/catalogs/${id}`, { status: normalizedStatus });
  return res.data?.data;
}

export async function getAdminCatalogStats(): Promise<CatalogStats> {
  const res = await apiClient.get('/admin/catalogs/stats');
  return res.data?.data;
}

export async function getMyCatalogStats(): Promise<CatalogStats> {
  const res = await apiClient.get('/catalogs/me/stats');
  return res.data?.data;
}

