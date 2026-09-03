import apiClient from './client';
import type { UserListItem } from '@/types/domain';

export interface AdminUserListItem extends UserListItem {
  phone?: string;
  status: string;
}

export interface AdminCreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'student' | 'talent' | 'superadministrator';
}

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  const res = await apiClient.get('/admin/users');
  return res.data?.data || [];
}

export async function createAdminUser(data: AdminCreateUserInput): Promise<AdminUserListItem> {
  const res = await apiClient.post('/admin/users', data);
  return res.data?.data;
}

export async function updateAdminUserStatus(
  id: string,
  status: 'active' | 'suspended' | 'inactive'
): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/status`, { status });
}

export async function resetAdminUserPassword(id: string, password: string): Promise<void> {
  await apiClient.post(`/admin/users/${id}/reset-password`, { password });
}
