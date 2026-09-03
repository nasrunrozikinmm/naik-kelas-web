import apiClient from "./client";

export interface UserAccountData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  profiles?: Array<{
    id: string;
    profile_type: string;
    display_name: string;
    bio?: string;
    education_level?: string;
    learning_goals?: string;
    interests?: string;
    english_level?: string;
    languages?: string[];
    verification_status?: string;
  }>;
}

export interface UpdateProfileInput {
  display_name: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordInput {
  current_password: string;
  new_password: string;
}

export interface PayoutAccountData {
  id?: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  branch?: string;
  is_verified?: boolean;
}

export interface PlatformSettingItem {
  key: string;
  value: string;
  description?: string;
  updated_at?: string;
}

// User & Profile
export async function getMyAccount(): Promise<UserAccountData> {
  const res = await apiClient.get("/me/account");
  return res.data?.data;
}

export async function getMyProfile() {
  const res = await apiClient.get("/me/profile");
  return res.data?.data;
}

export async function updateMyProfile(data: UpdateProfileInput): Promise<void> {
  await apiClient.put("/me/profile", data);
}

export async function changePassword(data: ChangePasswordInput): Promise<void> {
  await apiClient.put("/me/password", data);
}

// Student Preferences
export async function updateStudentPreferences(data: {
  learning_goals: string;
  education_level: string;
  interests: string;
  english_level: string;
  languages: string[];
}): Promise<void> {
  await apiClient.put("/me/profile/preferences", data);
}

// Talent Payout Account
export async function getPayoutAccount(): Promise<PayoutAccountData | null> {
  const res = await apiClient.get("/me/payout-account");
  return res.data?.data || null;
}

export async function savePayoutAccount(data: PayoutAccountData): Promise<PayoutAccountData> {
  const res = await apiClient.put("/me/payout-account", data);
  return res.data?.data;
}

// Admin Platform Settings
export async function getPlatformSettings(): Promise<PlatformSettingItem[]> {
  const res = await apiClient.get("/admin/settings");
  return res.data?.data || [];
}

export async function updatePlatformSettings(settings: Record<string, string>): Promise<void> {
  await apiClient.put("/admin/settings", { settings });
}
