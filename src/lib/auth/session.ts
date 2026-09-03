import type { UserRole } from "@/types/domain";

export const AUTH_COOKIES = {
  TOKEN: "nk_token",
  ROLE: "nk_role",
  USER: "nk_user"
} as const;

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Max-Age=0; SameSite=Lax`;
  document.cookie = `${name}=; Path=/; Max-Age=-1;`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface SessionData {
  userId: string;
  displayName: string;
  roles: UserRole[];
  activeRole: UserRole;
  accessToken: string;
}

export function saveSession(data: SessionData) {
  if (typeof window === "undefined") return;

  setCookie(AUTH_COOKIES.TOKEN, data.accessToken, 7);
  setCookie(AUTH_COOKIES.ROLE, data.activeRole, 7);
  setCookie(
    AUTH_COOKIES.USER,
    JSON.stringify({
      id: data.userId,
      name: data.displayName,
      roles: data.roles
    }),
    7
  );

  try {
    localStorage.setItem("nk_auth_session", JSON.stringify(data));
  } catch {
    // LocalStorage error fallback
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;

  deleteCookie(AUTH_COOKIES.TOKEN);
  deleteCookie(AUTH_COOKIES.ROLE);
  deleteCookie(AUTH_COOKIES.USER);

  try {
    localStorage.removeItem("nk_auth_session");
  } catch {
    // LocalStorage error fallback
  }
}

export function getStoredSession(): SessionData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("nk_auth_session") || localStorage.getItem("vision_auth_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.userId && parsed?.accessToken) {
        return parsed as SessionData;
      }
    }
  } catch {
    // Fall back to cookies
  }

  const token = getCookie(AUTH_COOKIES.TOKEN) || getCookie("vision_token");
  const role = (getCookie(AUTH_COOKIES.ROLE) || getCookie("vision_role") || "student") as UserRole;
  const rawUser = getCookie(AUTH_COOKIES.USER) || getCookie("vision_user");

  if (token) {
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        return {
          userId: user.id || "user",
          displayName: user.name || "User",
          roles: user.roles || [role],
          activeRole: role,
          accessToken: token
        };
      } catch {
        // Continue to token-only fallback
      }
    }
    return {
      userId: "user",
      displayName: "User",
      roles: [role],
      activeRole: role,
      accessToken: token
    };
  }

  return null;
}

