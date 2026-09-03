"use client";

import React, { useEffect, useState } from "react";
import { getTalentOrders, OrderListItem } from "@/lib/api/order";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import dayjs from "dayjs";

export default function TalentOrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const fetchOrders = async (status: string) => {
    try {
      setLoading(true);
      const res = await getTalentOrders(1, 50, status === "all" ? undefined : status);
      setOrders(res?.items || (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error("Failed to fetch talent orders", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Order Masuk
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Semua Status</MenuItem>
            <MenuItem value="pending_payment">Menunggu Pembayaran</MenuItem>
            <MenuItem value="paid">Dibayar</MenuItem>
            <MenuItem value="active">Aktif</MenuItem>
            <MenuItem value="completed">Selesai</MenuItem>
            <MenuItem value="cancelled">Dibatalkan</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Layanan</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tipe</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Siswa</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Total</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Fee Platform</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Net</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Tidak ada order.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>{order.catalog_title}</TableCell>
                  <TableCell>{order.catalog_type}</TableCell>
                  <TableCell>{order.student_name}</TableCell>
                  <TableCell>{dayjs(order.created_at).format('DD MMM YYYY HH:mm')}</TableCell>
                  <TableCell align="right">{formatRupiah(order.amount)}</TableCell>
                  <TableCell align="right" color="error.main">- {formatRupiah(order.platform_fee)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatRupiah(order.amount - order.platform_fee)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(order.status)} 
                      color={getStatusColor(order.status)} 
                      size="small" 
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
