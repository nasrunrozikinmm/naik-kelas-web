"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { removeItem, setQty, clearCart } from "@/store/slices/cartSlice";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/common/EmptyState";
import { useConfirm } from "@/hooks/useConfirm";
import { formatCurrency } from "@/lib/utils/format";

// MUI Icons
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function CartPage() {
  const router = useRouter();
  const items = useAppSelector((s) => s.cart.items);
  const dispatch = useAppDispatch();
  const { confirm } = useConfirm();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const totalQty = items.reduce((s, it) => s + it.qty, 0);
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const discount = promoApplied ? Math.min(50000, subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "NAIKKELASJUARA") {
      setPromoApplied(true);
    }
  };

  const handleClearCart = async () => {
    const isConfirmed = await confirm({
      title: "Kosongkan Keranjang Belanja?",
      message: "Apakah Anda yakin ingin menghapus semua item yang ada di keranjang belanja Anda?",
      confirmLabel: "Ya, Kosongkan",
      confirmColor: "error"
    });
    if (isConfirmed) {
      dispatch(clearCart());
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline group"
          >
            <ArrowBackIcon sx={{ fontSize: 16 }} className="group-hover:-translate-x-1 transition-transform" />
            <span>Kembali Jelajahi Marketplace</span>
          </Link>

          {/* Checkout Steps Indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1 text-primary">
              <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold">1</span>
              Keranjang
            </span>
            <span className="text-outline-variant">→</span>
            <span className="flex items-center gap-1 text-on-surface-variant">
              <span className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[10px] font-bold">2</span>
              Pembayaran
            </span>
            <span className="text-outline-variant">→</span>
            <span className="flex items-center gap-1 text-on-surface-variant">
              <span className="w-5 h-5 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-[10px] font-bold">3</span>
              Akses Kelas
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Keranjang Belanja
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Periksa kembali kelas dan paket bimbingan Anda sebelum melanjutkan ke transaksi.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-8 sm:p-12 shadow-xs">
            <EmptyState
              title="Keranjang Belanja Anda Kosong"
              description="Belum ada program bimbingan atau kursus yang dipilih. Temukan mentor berpengalaman dan mulailah belajar sekarang!"
              action={
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs sm:text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-xs"
                >
                  Jelajahi Katalog Program
                </Link>
              }
              icon={<ShoppingCartOutlinedIcon sx={{ fontSize: 44, color: "primary.main" }} />}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs sm:text-sm font-bold text-on-surface">
                  Daftar Pembelian ({totalQty} item)
                </span>
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-error hover:underline font-semibold"
                >
                  Kosongkan Semua
                </button>
              </div>

              {items.map((it) => (
                <div
                  key={it.id}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-4 sm:p-5 shadow-xs hover:border-outline-variant/60 transition-all flex flex-col sm:flex-row gap-4 sm:gap-5 relative overflow-hidden"
                >
                  {/* Item Image Thumbnail */}
                  <div className="relative w-full sm:w-28 h-36 sm:h-28 rounded-xl bg-surface-variant overflow-hidden shrink-0">
                    <Image
                      src={it.image || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=300"}
                      alt={it.title}
                      fill
                      sizes="(max-width: 640px) 100vw, 112px"
                      className="object-cover"
                    />
                  </div>

                  {/* Item Information & Controls */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="inline-block text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                            {it.type === "live_session" ? "Sesi Live" : it.type === "mentoring" ? "Mentoring 1-on-1" : "Kursus Video"}
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-on-surface line-clamp-2 leading-snug">
                            {it.title}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => dispatch(removeItem({ id: it.id }))}
                          aria-label="Hapus Item"
                          className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-lg transition-colors shrink-0"
                          title="Hapus dari keranjang"
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                        </button>
                      </div>

                      {it.talentName && (
                        <p className="text-xs text-on-surface-variant mt-1">
                          Mentor: <strong className="text-on-surface">{it.talentName}</strong>
                        </p>
                      )}
                    </div>

                    {/* Price & Stepper Row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-outline-variant/20 gap-3 flex-wrap">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-base sm:text-lg text-primary">
                          {formatCurrency(it.price * it.qty)}
                        </span>
                        {it.qty > 1 && (
                          <span className="text-[11px] text-on-surface-variant">
                            ({formatCurrency(it.price)} / sesi)
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-outline-variant/40 rounded-xl bg-surface-container-low/50 overflow-hidden">
                        <button
                          type="button"
                          aria-label="Kurangi Jumlah"
                          onClick={() => dispatch(setQty({ id: it.id, qty: Math.max(1, it.qty - 1) }))}
                          disabled={it.qty <= 1}
                          className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <RemoveIcon sx={{ fontSize: 14 }} />
                        </button>

                        <span className="w-9 text-center text-xs font-bold text-on-surface">
                          {it.qty}
                        </span>

                        <button
                          type="button"
                          aria-label="Tambah Jumlah"
                          onClick={() => dispatch(setQty({ id: it.id, qty: it.qty + 1 }))}
                          className="w-8 h-8 flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
                        >
                          <AddIcon sx={{ fontSize: 14 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Sticky Order Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 shadow-xs space-y-6">
                <h3 className="font-bold text-base text-on-surface pb-3 border-b border-outline-variant/20">
                  Ringkasan Belanja
                </h3>

                {/* Pricing Breakdown */}
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal ({totalQty} item)</span>
                    <span className="font-bold text-on-surface">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-on-surface-variant">
                    <span>Biaya Layanan Platform</span>
                    <span className="font-bold text-[#008545]">Gratis</span>
                  </div>

                  {promoApplied && (
                    <div className="flex justify-between text-secondary">
                      <span className="flex items-center gap-1 font-semibold">
                        <LocalOfferOutlinedIcon sx={{ fontSize: 14 }} />
                        Diskon Promo
                      </span>
                      <span className="font-bold">- {formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="pt-3 border-t border-outline-variant/20">
                  <label htmlFor="promo-input" className="block text-[11px] font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider">
                    Kode Promo / Voucher
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="promo-input"
                      type="text"
                      placeholder="Contoh: NAIKKELASJUARA"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={promoApplied}
                      className="flex-1 px-3 py-2 text-xs uppercase font-semibold rounded-xl border border-outline-variant/40 bg-surface-container-low/40 focus:ring-1 focus:ring-primary outline-none"
                    />
                    <button
                      type="submit"
                      disabled={promoApplied || !promoCode.trim()}
                      className="px-3.5 py-2 bg-surface-container text-on-surface text-xs font-bold rounded-xl hover:bg-surface-variant disabled:opacity-40 transition-colors"
                    >
                      {promoApplied ? "Terpasang" : "Gunakan"}
                    </button>
                  </div>
                  {promoApplied && (
                    <p className="text-[11px] text-[#008545] font-semibold mt-1.5 flex items-center gap-1">
                      <CheckCircleOutlineIcon sx={{ fontSize: 13 }} />
                      Voucher berhasil digunakan!
                    </p>
                  )}
                </form>

                {/* Grand Total */}
                <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-on-surface-variant block">Total Pembayaran</span>
                    <span className="font-bold text-xl sm:text-2xl text-primary">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  type="button"
                  onClick={() => {
                    const checkoutItems = items.map((it) => ({
                      id: it.id,
                      title: it.title,
                      price: it.price,
                      quantity: it.qty,
                      type: it.type || "course",
                    }));
                    localStorage.setItem("nk_checkout_items", JSON.stringify(checkoutItems));
                    router.push("/checkout");
                  }}
                  className="w-full py-3.5 bg-primary text-white font-bold rounded-xl text-center text-sm block hover:bg-primary/90 shadow-xs transition-all active:scale-[0.99] cursor-pointer"
                >
                  Lanjut ke Pembayaran
                </button>

                {/* Security Trust Badges */}
                <div className="pt-4 border-t border-outline-variant/20 space-y-2 text-[11px] text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <LockOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <span>Pembayaran Aman & Terenkripsi 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VerifiedUserOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
                    <span>Garansi Akses Materi & Mentor Terverifikasi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

