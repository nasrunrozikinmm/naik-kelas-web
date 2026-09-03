export type UserRole = "student" | "talent" | "superadministrator";

export type UserStatus = "active" | "inactive" | "suspended";

export type VerificationStatus = "pending" | "approved" | "rejected";

export type CatalogType =
  | "live_session"
  | "recorded_course"
  | "document_material"
  | "chat_consultation"
  | "mentoring"
  | "course";

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  status?: string;
}

export interface CatalogCardModel {
  id: string;
  title: string;
  talentName: string;
  type: CatalogType | string;
  price: number;
  rating: number;
  category: string;
  image?: string;
  reviewsCount?: number;
  soldCount?: number;
  excerpt?: string;
  badge?: { label: string; variant?: "primary" | "secondary" | "live" | "default" };
  talent_profile_id?: string;
  category_id?: string;
  description?: string;
  isVerified?: boolean;
  mentorTitle?: string;
  institution?: string;
  sessionsCount?: number;
}

export interface FeaturedMentor {
  id: string;
  name: string;
  title: string;
  institution: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  sessionsCount: number;
  isVerified: boolean;
  expertise: string[];
  topScholarship?: string;
  bio?: string;
}

export interface CatalogDetail extends CatalogCardModel {
  content?: string;
  requirements?: string[];
  scheduleSlots?: {
    id: string;
    startTime: string;
    endTime: string;
    capacity: number;
    bookedCount: number;
    status: string;
  }[];
}

export interface TransactionModel {
  id: string;
  user: string;
  amount: number;
  status: "pending" | "settled" | "failed";
  product?: string;
  time?: string;
}

export interface MessageModel {
  id: string;
  from: string;
  text: string;
  createdAt?: string;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  status: UserStatus;
  joinDate?: string;
  created_at?: string;
  avatar_url?: string;
}

export interface TalentKYCDocuments {
  ktp_url?: string;
  ktp_name?: string;
  ijazah_url?: string;
  ijazah_name?: string;
}

export interface TalentApprovalItem {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  education_level?: string;
  expertise: string;
  experience_years?: number;
  portfolio?: string;
  starting_price?: number;
  verification_status: VerificationStatus | string;
  created_at: string;
  documents: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  code: number;
  data: T;
  meta?: {
    request_id?: string;
    pagination?: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  };
}

export interface ApiErrorResponse {
  success: false;
  code: number;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
  meta?: {
    request_id?: string;
  };
}

