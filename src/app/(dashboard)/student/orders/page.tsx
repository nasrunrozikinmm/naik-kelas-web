"use client";

import React, { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import { getMyOrders, OrderListItem } from "@/lib/api/order";
import { Pagination } from "@/components/common";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Button, CircularProgress } from "@mui/material";
import dayjs from "dayjs";
import { loadSnapScript } from "@/lib/utils/midtrans";

export default function StudentOrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyOrders(page, perPage);
      setOrders(res?.items || (Array.isArray(res) ? res : []));
      setTotal(res?.total || 0);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  }, [page, perPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatRupiah = (amount: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);

  const getStatusColor = (status: string): "warning" | "success" | "info" | "error" | "default" => {
    switch (status) {
      case 'pending_payment': return 'warning';
      case 'paid':
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_payment': return 'Menunggu Pembayaran';
      case 'paid': return 'Dibayar';
      case 'active': return 'Aktif';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const handlePay = async (snapToken: string, paymentUrl?: string | null) => {
    const isProd = paymentUrl ? !paymentUrl.includes("sandbox") : false;
    await loadSnapScript(isProd, process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-ltOrdcfG7ulFaetg");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.snap) {
      w.snap.pay(snapToken, {
        onSuccess: () => fetchOrders(),
        onPending: () => fetchOrders(),
        onError: () => fetchOrders(),
        onClose: () => fetchOrders(),
      });
    }
  };

  const isMidtransProd = process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production";
  const snapScriptUrl = isMidtransProd
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <Box>
      <Script
        src={snapScriptUrl}
        strategy="lazyOnload"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-ltOrdcfG7ulFaetg"}
      />
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Pesanan Saya
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Layanan</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tipe</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mentor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : !orders || orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Belum ada pesanan.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              (orders || []).map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.catalog_title}</TableCell>
                  <TableCell>{order.catalog_type}</TableCell>
                  <TableCell>{order.talent_name}</TableCell>
                  <TableCell>{dayjs(order.created_at).format('DD MMM YYYY HH:mm')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatRupiah(order.amount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(order.status)} 
                      color={getStatusColor(order.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {order.status === 'pending_payment' && order.snap_token && (
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={() => handlePay(order.snap_token!, order.payment_url)}
                      >
                        Bayar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {total > 0 && (
        <div className="mt-4 p-4 bg-white dark:bg-surface-container-low rounded-2xl border border-outline-variant/30">
          <Pagination
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={setPage}
            onPerPageChange={(pp) => {
              setPerPage(pp);
              setPage(1);
            }}
          />
        </div>
      )}
    </Box>
  );
}
