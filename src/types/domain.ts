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

export interface ScheduleSlot {
  id?: string;
  catalog_id?: string;
  talent_profile_id?: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count?: number;
  status?: string;
}

export interface Catalog {
  id: string;
  talent_profile_id: string;
  category_id: string;
  title: string;
  description: string;
  type: CatalogType | string;
  price: number;
  duration?: number;
  quota?: number;
  status: "draft" | "pending_review" | "published" | "rejected" | "archived" | string;
  requirements?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  schedule_slots?: ScheduleSlot[];
}

export interface TalentProfileInfo {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  institution?: string;
  bio?: string;
  expertise?: string[];
  rating?: number;
  reviewsCount?: number;
  sessionsCount?: number;
  experienceYears?: number;
  languages?: string[];
  isVerified?: boolean;
}

export interface CatalogCardModel {
  id: string;
  title: string;
  talentName: string;
  talentAvatar?: string;
  talentTitle?: string;
  mentorTitle?: string;
  institution?: string;
  talentBio?: string;
  talentExpertise?: string[];
  talentRating?: number;
  talentReviewsCount?: number;
  talentSessionsCount?: number;
  talentExperienceYears?: number;
  talentLanguages?: string[];
  isVerified?: boolean;
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
  talentProfile?: TalentProfileInfo;
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
  curriculum?: { title: string; description: string; duration?: string }[];
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

