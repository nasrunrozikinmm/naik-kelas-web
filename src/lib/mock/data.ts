// Lightweight mock data and fetch helpers to emulate API contract
import type { CatalogCardModel, TransactionModel, MessageModel } from "@/types/domain";

export const mockFeaturedCatalogs: CatalogCardModel[] = [
  {
    id: "catalog-live-english",
    title: "Private English Speaking untuk Interview",
    talentName: "Nadia Prameswari",
    type: "live_session",
    price: 175000,
    rating: 4.8,
    category: "English",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcd",
    reviewsCount: 128,
    soldCount: 420,
    excerpt: "Latihan percakapan intensif untuk persiapan interview kerja atau beasiswa.",
    badge: { label: "Live Session", variant: "live" }
  },
  {
    id: "catalog-recorded-go",
    title: "Dasar Backend Golang untuk Pemula",
    talentName: "Alya Santoso",
    type: "recorded_course",
    price: 199000,
    rating: 4.7,
    category: "Programming",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=efgh",
    reviewsCount: 85,
    soldCount: 1500,
    excerpt: "Kursus pengantar backend menggunakan Go, fokus pada praktik dan pola umum.",
    badge: { label: "Recorded", variant: "secondary" }
  }
];

export const mockAdminTransactions: TransactionModel[] = [
  { id: "txn_1", user: "Raka", amount: 250000, status: "settled" },
  { id: "txn_2", user: "Siti", amount: 175000, status: "pending" }
];

export const mockMessages: MessageModel[] = [
  { id: "m1", from: "Nadia", text: "Halo, saya tersedia jam 4 sore", createdAt: new Date().toISOString() },
  { id: "m2", from: "Alya", text: "Bisa kirim materi pra-kelas?", createdAt: new Date().toISOString() }
];

// Simulate API contract: { success, code, data }
export async function fetchFeaturedCatalogs() {
  return Promise.resolve({ success: true, code: 200, data: mockFeaturedCatalogs });
}

export async function fetchAdminTransactions(): Promise<{ success: true; code: number; data: TransactionModel[] }> {
  return Promise.resolve({ success: true, code: 200, data: mockAdminTransactions });
}

export async function fetchMessages(): Promise<{ success: true; code: number; data: MessageModel[] }> {
  return Promise.resolve({ success: true, code: 200, data: mockMessages });
}
