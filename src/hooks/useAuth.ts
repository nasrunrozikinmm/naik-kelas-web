import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession, setActiveRole } from "@/store/slices/authSlice";
import { getRoleDashboardUrl } from "@/lib/utils/role";
import type { UserRole } from "@/types/domain";

export function useAuth() {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const activeRole = auth.activeRole;
  const isStudent = activeRole === "student";
  const isTalent = activeRole === "talent";
  const isAdmin = activeRole === "superadministrator";

  const dashboardUrl = getRoleDashboardUrl(activeRole);

  const logout = useCallback(() => {
    dispatch(clearSession());
    router.push("/auth/login");
  }, [dispatch, router]);

  const changeRole = useCallback(
    (role: UserRole) => {
      dispatch(setActiveRole(role));
    },
    [dispatch]
  );

  return {
    userId: auth.userId,
    displayName: auth.displayName,
    roles: auth.roles,
    activeRole,
    accessToken: auth.accessToken,
    isAuthenticated: auth.isAuthenticated,
    isStudent,
    isTalent,
    isAdmin,
    dashboardUrl,
    logout,
    changeRole
  };
}
