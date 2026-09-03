"use client";

import React, { useEffect, useState } from "react";
import { getAdminTransactions, OrderListItem } from "@/lib/api/order";
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Drawer, IconButton, Stack, Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import dayjs from "dayjs";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrawer, setSelectedDrawer] = useState<OrderListItem | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getAdminTransactions(1, 50);
      setTransactions(res?.items || (Array.isArray(res) ? res : []));
    } catch (error) {
      console.error("Failed to fetch admin transactions", error);
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

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Manajemen Transaksi
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Siswa</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Mentor</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Layanan</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Fee</TableCell>
              <TableCell sx={{ fontWeight: 'bold', align: 'right' }}>Net</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Provider</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">Tidak ada transaksi.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((trx) => (
                <TableRow 
                  key={trx.id} 
                  hover 
                  onClick={() => setSelectedDrawer(trx)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontFamily: 'monospace' }}>{trx.id.substring(0, 8)}...</TableCell>
                  <TableCell>{trx.student_name}</TableCell>
                  <TableCell>{trx.talent_name}</TableCell>
                  <TableCell>{trx.catalog_title}</TableCell>
                  <TableCell align="right">{formatRupiah(trx.amount)}</TableCell>
                  <TableCell align="right">{formatRupiah(trx.platform_fee)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatRupiah(trx.amount - trx.platform_fee)}</TableCell>
                  <TableCell>
                    <Chip label={trx.status} color={getStatusColor(trx.status)} size="small" />
                  </TableCell>
                  <TableCell>{trx.payment_provider || '-'}</TableCell>
                  <TableCell>{dayjs(trx.created_at).format('DD MMM YY HH:mm')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Drawer
        anchor="right"
        open={!!selectedDrawer}
        onClose={() => setSelectedDrawer(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 } } }}
      >
        {selectedDrawer && (
          <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'grey.50' }}>
              <Typography variant="h6" fontWeight="bold">Detail Transaksi</Typography>
              <IconButton onClick={() => setSelectedDrawer(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Order ID</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{selectedDrawer.id}</Typography>
                    <IconButton size="small" onClick={() => handleCopy(selectedDrawer.id)}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                  <Typography variant="subtitle2" color="primary.main" gutterBottom>Status</Typography>
                  <Chip label={selectedDrawer.status} color={getStatusColor(selectedDrawer.status)} />
                </Box>

                <Stack spacing={2} divider={<Divider />}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Layanan</Typography>
                    <Typography fontWeight="medium">{selectedDrawer.catalog_title}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedDrawer.catalog_type}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Partisipan</Typography>
                    <Typography><strong>Siswa:</strong> {selectedDrawer.student_name}</Typography>
                    <Typography><strong>Mentor:</strong> {selectedDrawer.talent_name}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Informasi Pembayaran</Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Provider</Typography>
                        <Typography variant="body2" fontWeight="bold">{selectedDrawer.payment_provider || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Tanggal Dibuat</Typography>
                        <Typography variant="body2">{dayjs(selectedDrawer.created_at).format('DD MMM YYYY HH:mm')}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Tanggal Dibayar</Typography>
                        <Typography variant="body2">{selectedDrawer.paid_at ? dayjs(selectedDrawer.paid_at).format('DD MMM YYYY HH:mm') : '-'}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Rincian Finansial</Typography>
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Total Amount</Typography>
                        <Typography fontWeight="bold">{formatRupiah(selectedDrawer.amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Platform Fee</Typography>
                        <Typography color="error.main">- {formatRupiah(selectedDrawer.platform_fee)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography>Net Revenue (Mentor)</Typography>
                        <Typography fontWeight="bold" color="primary.main">{formatRupiah(selectedDrawer.amount - selectedDrawer.platform_fee)}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Box>
        )}
      </Drawer>
    </Box>
  );
}
