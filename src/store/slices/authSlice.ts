import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserRole } from "@/types/domain";
import {
  saveSession,
  clearSession as clearStorageSession,
  setCookie,
  AUTH_COOKIES
} from "@/lib/auth/session";

type AuthState = {
  userId: string | null;
  displayName: string | null;
  roles: UserRole[];
  activeRole: UserRole | null;
  accessToken: string | null;
  isAuthenticated: boolean;
};

const initialState: AuthState = {
  userId: null,
  displayName: null,
  roles: [],
  activeRole: null,
  accessToken: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<Omit<AuthState, "isAuthenticated">>) {
      state.userId = action.payload.userId;
      state.displayName = action.payload.displayName;
      state.roles = action.payload.roles;
      state.activeRole = action.payload.activeRole;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = Boolean(action.payload.userId);

      if (action.payload.userId && action.payload.accessToken && action.payload.activeRole) {
        saveSession({
          userId: action.payload.userId,
          displayName: action.payload.displayName || "",
          roles: action.payload.roles,
          activeRole: action.payload.activeRole,
          accessToken: action.payload.accessToken
        });
      }
    },
    setActiveRole(state, action: PayloadAction<UserRole>) {
      state.activeRole = action.payload;
      setCookie(AUTH_COOKIES.ROLE, action.payload, 7);
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      setCookie(AUTH_COOKIES.TOKEN, action.payload, 7);
    },
    clearSession() {
      clearStorageSession();
      return initialState;
    }
  }
});

export const { setSession, setActiveRole, setAccessToken, clearSession } = authSlice.actions;
export default authSlice.reducer;

