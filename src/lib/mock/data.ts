// Lightweight mock data and fetch helpers to emulate API contract
import type { CatalogCardModel, TransactionModel, MessageModel } from "@/types/domain";

export const mockFeaturedCatalogs: CatalogCardModel[] = [
  {
    id: "catalog-lpdp-intensive",
    title: "Intensive Mentoring Beasiswa LPDP (Afirmasi & Reguler)",
    talentName: "Dr. Amanda Wijaya, M.Sc.",
    talentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400",
    talentTitle: "Alumni Oxford University",
    institution: "Awardee LPDP Luar Negeri",
    talentBio: "Berpengalaman mendampingi 80+ awardee lolos seleksi beasiswa S2/S3 di Inggris dan Eropa dengan kurasi esai dan simulasi wawancara mendalam.",
    talentExpertise: ["Beasiswa LPDP", "Motivation Letter", "Mock Interview", "Oxford & UK Admissions"],
    talentRating: 4.98,
    talentReviewsCount: 142,
    talentSessionsCount: 310,
    talentExperienceYears: 6,
    talentLanguages: ["Bahasa Indonesia", "English (Fluent)"],
    isVerified: true,
    talent_profile_id: "mentor-amanda-wijaya",
    type: "live_session",
    price: 450000,
    rating: 4.95,
    category: "Beasiswa",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    reviewsCount: 142,
    soldCount: 310,
    excerpt: "Bimbingan intensif persiapan berkas, esai kontribusi, dan simulasi wawancara bersama alumni peraih beasiswa.",
    badge: { label: "Live Session", variant: "live" }
  },
  {
    id: "catalog-live-english",
    title: "Private English Speaking untuk Interview",
    talentName: "Nadia Prameswari",
    title: "Private English Speaking & Interview Preparation",
    talentName: "Nadia Prameswari, S.Hum.",
    talentAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400",
    talentTitle: "IELTS 8.5 Master Tutor",
    institution: "British Council Certified Instructor",
    talentBio: "Tutor bahasa Inggris bersertifikasi Cambridge & British Council dengan spesialisasi kelancaran berbicara untuk wawancara beasiswa dan kerja global.",
    talentExpertise: ["IELTS Speaking", "Job Interview", "Business English", "Pronunciation"],
    talentRating: 4.9,
    talentReviewsCount: 128,
    talentSessionsCount: 420,
    talentExperienceYears: 5,
    talentLanguages: ["Bahasa Indonesia", "English (Native/C2)"],
    isVerified: true,
    talent_profile_id: "mentor-nadia-prameswari",
    type: "live_session",
    price: 175000,
    rating: 4.8,
    category: "English",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcd",
    rating: 4.88,
    category: "Bahasa",
    image: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=1200&auto=format&fit=crop",
    reviewsCount: 128,
    soldCount: 420,
    excerpt: "Latihan percakapan intensif untuk persiapan interview kerja atau beasiswa.",
    excerpt: "Latihan percakapan intensif untuk persiapan interview kerja atau beasiswa dunia.",
    badge: { label: "Live Session", variant: "live" }
  },
  {
    id: "catalog-recorded-go",
    title: "Dasar Backend Golang untuk Pemula",
    talentName: "Alya Santoso",
    title: "Masterclass Backend Golang & Clean Architecture",
    talentName: "Alya Santoso, S.Kom.",
    talentAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400",
    talentTitle: "Senior Backend Engineer",
    institution: "Tech Lead & Go Community Builder",
    talentBio: "Praktisi arsitektur backend berskala tinggi dengan pengalaman 7+ tahun membangun sistem microservices dan API modern berbasis Go.",
    talentExpertise: ["Go (Golang)", "Clean Architecture", "PostgreSQL", "Microservices"],
    talentRating: 4.85,
    talentReviewsCount: 85,
    talentSessionsCount: 1500,
    talentExperienceYears: 7,
    talentLanguages: ["Bahasa Indonesia", "English"],
    isVerified: true,
    talent_profile_id: "mentor-alya-santoso",
    type: "recorded_course",
    price: 199000,
    rating: 4.7,
    rating: 4.85,
    category: "Programming",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=efgh",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1200&auto=format&fit=crop",
    reviewsCount: 85,
    soldCount: 1500,
    excerpt: "Kursus pengantar backend menggunakan Go, fokus pada praktik dan pola umum.",
    badge: { label: "Recorded", variant: "secondary" }
    excerpt: "Kursus komprehensif backend Golang dari nol hingga produksi dengan clean architecture.",
    badge: { label: "Video Course", variant: "secondary" }
  },
  {
    id: "catalog-aas-mentoring",
    title: "Intensive Mentoring Beasiswa AAS (Australia Awards)",
    talentName: "Rian Pratama, B.Eng., MBA",
    talentAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
    talentTitle: "Harvard Kennedy School Alum",
    institution: "AAS & Fulbright Scholar",
    talentBio: "Spesialisasi kurasi esai kontribusi pembangunan dan strategi interview beasiswa Amerika & Australia.",
    talentExpertise: ["AAS Australia", "Fulbright US", "Study Plan", "Leadership Essay"],
    talentRating: 4.95,
    talentReviewsCount: 98,
    talentSessionsCount: 225,
    talentExperienceYears: 5,
    talentLanguages: ["Bahasa Indonesia", "English (Fluent)"],
    isVerified: true,
    talent_profile_id: "mentor-rian-pratama",
    type: "mentoring",
    price: 500000,
    rating: 4.95,
    category: "Beasiswa",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    reviewsCount: 98,
    soldCount: 225,
    excerpt: "Bimbingan terstruktur bedah aplikasi beasiswa Australia Awards bersama awardee berpengalaman.",
    badge: { label: "Mentoring", variant: "primary" }
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
