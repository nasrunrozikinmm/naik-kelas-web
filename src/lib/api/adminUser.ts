import apiClient from './client';
import type { UserListItem, UserRole, UserStatus, PaginatedResult, TalentApprovalItem } from '@/types/domain';

export interface AdminUserListItem extends UserListItem {
  phone?: string;
  status: UserStatus;
  roles?: (UserRole | string)[];
}

export interface AdminCreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'student' | 'talent' | 'superadministrator';
}

export interface AdminUpdateUserInput {
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'talent';
}

export async function getAdminUsers(params?: {
  role?: string;
  status?: string;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResult<AdminUserListItem>> {
  const res = await apiClient.get('/admin/users', { params });
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

export async function getTalentApprovals(params?: {
  status?: string;
  q?: string;
  page?: number;
  per_page?: number;
}): Promise<PaginatedResult<TalentApprovalItem>> {
  const res = await apiClient.get('/admin/talent-approvals', { params });
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

export async function createAdminUser(data: AdminCreateUserInput): Promise<AdminUserListItem> {
  const res = await apiClient.post('/admin/users', data);
  return res.data?.data;
}

export async function updateAdminUser(id: string, data: AdminUpdateUserInput): Promise<AdminUserListItem> {
  const res = await apiClient.put(`/admin/users/${id}`, data);
  return res.data?.data;
}

export async function updateAdminUserStatus(
  id: string,
  status: 'active' | 'suspended'
): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/status`, { status });
}

export async function resetAdminUserPassword(id: string, password: string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/reset-password`, { password });
}
