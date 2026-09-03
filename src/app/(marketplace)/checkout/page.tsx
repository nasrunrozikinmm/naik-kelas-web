"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkout } from "@/lib/api/order";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { getStoredSession } from "@/lib/auth/session";
import { loadSnapScript } from "@/lib/utils/midtrans";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

interface CheckoutItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  type: string;
}

export default function CheckoutPage() {
  const [items, setItems] = useState<CheckoutItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const reduxCartItems = useAppSelector((s) => s.cart.items);
  const reduxToken = useAppSelector((s) => s.auth.accessToken);

  useEffect(() => {
    let checkoutItems: CheckoutItem[] = [];

    // 1. Cek dari localStorage (diset saat klik lanjut pembayaran dari /cart)
    const stored = localStorage.getItem("nk_checkout_items");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          checkoutItems = parsed;
        }
      } catch {
        console.error("Failed to parse checkout items");
      }
    }

    // 2. Jika di localStorage kosong, ambil langsung dari Redux cart items
    if (checkoutItems.length === 0 && reduxCartItems.length > 0) {
      checkoutItems = reduxCartItems.map((it) => ({
        id: it.id,
        title: it.title,
        price: it.price,
        quantity: it.qty,
        type: it.type || "course",
      }));
      localStorage.setItem("nk_checkout_items", JSON.stringify(checkoutItems));
    }

    setItems(checkoutItems);
    setInitialized(true);
  }, [reduxCartItems]);

  const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const platformFee = totalAmount * 0.05;
  const grandTotal = totalAmount + platformFee;

  const handlePayment = async () => {
    if (items.length === 0) return;

    // Pastikan user memiliki sesi sebelum memanggil API checkout
    const session = getStoredSession();
    const token = reduxToken || session?.accessToken;
    if (!token) {
      setError("Silakan masuk ke akun Anda terlebih dahulu untuk menyelesaikan transaksi.");
      setTimeout(() => {
        router.push("/auth/login?redirect=/checkout");
      }, 1000);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const itemIds = items.map((i) => i.id);
      const idempotencyKey = crypto.randomUUID();
      const res = await checkout({ cart_item_ids: itemIds }, idempotencyKey);

      if (res.snap_token) {
        if (res.snap_token.startsWith("mock-snap-")) {
          dispatch(clearCart());
          localStorage.removeItem("nk_checkout_items");
          router.push("/student/dashboard?payment=success");
          return;
        }

        const isProdToken = res.payment_url ? !res.payment_url.includes("sandbox") : false;
        await loadSnapScript(
          isProdToken,
          process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-ltOrdcfG7ulFaetg"
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (!w.snap) {
          throw new Error("Sistem pembayaran Midtrans sedang dimuat, silakan coba beberapa saat lagi.");
        }

        w.snap.pay(res.snap_token, {
          onSuccess: function () {
            dispatch(clearCart());
            localStorage.removeItem("nk_checkout_items");
            router.push("/student/dashboard?payment=success");
          },
          onPending: function () {
            dispatch(clearCart());
            localStorage.removeItem("nk_checkout_items");
            router.push("/student/orders");
          },
          onError: function () {
            setError("Pembayaran gagal atau dibatalkan, silakan coba lagi.");
          },
          onClose: function () {
            setError("Anda menutup jendela pembayaran sebelum menyelesaikannya.");
          },
        });
      } else if (res.payment_url) {
        dispatch(clearCart());
        localStorage.removeItem("nk_checkout_items");
        window.location.href = res.payment_url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses pembayaran");
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);

  const isMidtransProd = process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production";
  const snapScriptUrl = isMidtransProd
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

  return (
    <AppShell>
      <Script
        src={snapScriptUrl}
        strategy="lazyOnload"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "Mid-client-ltOrdcfG7ulFaetg"}
      />
      <Box component="main" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          {/* Breadcrumb / Back Link */}
          <Box sx={{ mb: 3 }}>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline group"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} className="group-hover:-translate-x-1 transition-transform" />
              <span>Kembali ke Keranjang Belanja</span>
            </Link>
          </Box>

          <Typography component="h1" variant="h4" sx={{ mb: 4, fontWeight: "bold" }}>
            Pembayaran & Checkout
          </Typography>

          {!initialized ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : items.length === 0 ? (
            <Paper variant="outlined" sx={{ p: { xs: 4, sm: 6 }, borderRadius: 3 }}>
              <EmptyState
                title="Tidak Ada Item untuk Di-checkout"
                description="Keranjang belanja Anda saat ini kosong atau belum ada layanan yang dipilih untuk checkout."
                action={
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Link
                      href="/cart"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-surface-container text-on-surface text-xs sm:text-sm font-bold rounded-xl hover:bg-surface-variant transition-colors"
                    >
                      Buka Keranjang
                    </Link>
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs"
                    >
                      Jelajahi Program Belajar
                    </Link>
                  </Stack>
                }
                icon={<ShoppingBagOutlinedIcon sx={{ fontSize: 44, color: "primary.main" }} />}
              />
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                    Ringkasan Pesanan
                  </Typography>
                  <Stack spacing={2} divider={<Divider />}>
                    {items.map((item, idx) => (
                      <Box key={idx} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                          <Typography fontWeight="semibold">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.type === "live_session" ? "Sesi Live" : item.type === "mentoring" ? "Mentoring 1-on-1" : "Kursus Video"} • {item.quantity} sesi
                          </Typography>
                        </Box>
                        <Typography fontWeight="bold" color="text.primary">
                          {formatRupiah(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Box sx={{ p: 3, bgcolor: "grey.50", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="text.secondary" variant="body2">Subtotal</Typography>
                      <Typography fontWeight="medium">{formatRupiah(totalAmount)}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography color="text.secondary" variant="body2">Biaya Layanan Platform (5%)</Typography>
                      <Typography fontWeight="medium">{formatRupiah(platformFee)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <Typography variant="h6" fontWeight="bold">Total Pembayaran</Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatRupiah(grandTotal)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handlePayment}
                  disabled={loading}
                  sx={{ py: 1.5, borderRadius: 2.5, fontSize: "1.05rem", fontWeight: "bold" }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Bayar Sekarang (Midtrans Snap)"}
                </Button>

                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, pt: 1, color: "text.secondary", fontSize: "0.75rem" }}>
                  <Box sx={{ display: "flex", items: "center", gap: 1 }}>
                    <LockOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <span>Enkripsi 256-bit aman via Midtrans Gateway</span>
                  </Box>
                  <Box sx={{ display: "flex", items: "center", gap: 1 }}>
                    <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <span>Garansi Akses Materi & Terverifikasi</span>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          )}
        </Container>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </AppShell>
  );
}
