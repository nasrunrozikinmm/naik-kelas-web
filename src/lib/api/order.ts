import apiClient from './client';
import type { TransactionStats, TalentOrderStats } from '@/types/domain';

export interface CheckoutReq {
  cart_item_ids: string[];
}

export interface CheckoutResp {
  order_id: string;
  snap_token: string;
  payment_url: string;
  amount: number;
}

export interface OrderListItem {
  id: string;
  catalog_title: string;
  catalog_type: string;
  talent_name: string;
  student_name: string;
  amount: number;
  platform_fee: number;
  status: string;
  payment_status: string;
  payment_provider: string;
  payment_url: string | null;
  snap_token: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface PaginatedOrders {
  items: OrderListItem[];
  total: number;
  page: number;
  limit: number;
}

export async function checkout(req: CheckoutReq, idempotencyKey: string): Promise<CheckoutResp> {
  const res = await apiClient.post('/checkout', req, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return res.data.data;
}

export async function getMyOrders(page = 1, limit = 10): Promise<PaginatedOrders> {
  const res = await apiClient.get('/me/orders', { params: { page, limit } });
  const data = res.data.data;
  if (Array.isArray(data)) {
    return {
      items: data,
      total: res.data.meta?.total ?? data.length,
      page: res.data.meta?.page ?? page,
      limit: res.data.meta?.per_page ?? limit,
    };
  }
  return data || { items: [], total: 0, page: 1, limit };
}

export async function getTalentOrders(page = 1, limit = 10, status?: string): Promise<PaginatedOrders> {
  const res = await apiClient.get('/me/talent/orders', { params: { page, limit, status } });
  const data = res.data.data;
  if (Array.isArray(data)) {
    return {
      items: data,
      total: res.data.meta?.total ?? data.length,
      page: res.data.meta?.page ?? page,
      limit: res.data.meta?.per_page ?? limit,
    };
  }
  return data || { items: [], total: 0, page: 1, limit };
}

export async function getAdminTransactions(page = 1, limit = 10, status?: string): Promise<PaginatedOrders> {
  const res = await apiClient.get('/admin/transactions', { params: { page, limit, status } });
  const data = res.data.data;
  if (Array.isArray(data)) {
    return {
      items: data,
      total: res.data.meta?.total ?? data.length,
      page: res.data.meta?.page ?? page,
      limit: res.data.meta?.per_page ?? limit,
    };
  }
  return data || { items: [], total: 0, page: 1, limit };
}

export async function getAdminTransactionDetail(id: string): Promise<OrderListItem> {
  const res = await apiClient.get(`/admin/transactions/${id}`);
  return res.data.data;
}

export async function getAdminTransactionStats(): Promise<TransactionStats> {
  const res = await apiClient.get('/admin/transactions/stats');
  return res.data.data;
}

export async function getTalentOrderStats(): Promise<TalentOrderStats> {
  const res = await apiClient.get('/me/talent/orders/stats');
  return res.data.data;
}

