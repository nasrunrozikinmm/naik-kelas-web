export const endpoints = {
  health: "/health",
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    refreshToken: "/auth/refresh",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password"
  },
  categories: {
    list: "/categories",
    detail: (id: string) => `/categories/${id}`
  },
  catalog: {
    list: "/catalogs",
    me: "/catalogs/me",
    detail: (id: string) => `/catalogs/${id}`,
    scheduleSlots: (id: string) => `/catalogs/${id}/schedule-slots`
  },
  media: {
    upload: "/media/upload",
    delete: "/media"
  },
  profile: {
    me: "/me/profile",
    preferences: "/me/profile/preferences",
    kyc: "/me/profile/kyc"
  },
  admin: {
    dashboard: "/admin/dashboard",
    talentApprovals: "/admin/talent-approvals",
    approveTalent: (id: string) => `/admin/talent-approvals/${id}/approve`,
    rejectTalent: (id: string) => `/admin/talent-approvals/${id}/reject`,
    users: "/admin/users"
  },
  cart: {
    get: "/cart",
    addItem: "/cart/items",
    removeItem: (itemId: string) => `/cart/items/${itemId}`
  },
  checkout: "/checkout"
} as const;
