'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { RootState } from '@/store';
import { Box, Button, CircularProgress, Typography, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { setSession, clearSession } from '@/store/slices/authSlice';
import { getStoredSession } from '@/lib/auth/session';
import { getRoleDashboardUrl } from '@/lib/utils/role';
import type { UserRole } from '@/types/domain';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { isAuthenticated, roles, activeRole, accessToken } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      // 1. If Redux already has authenticated session
      if (isAuthenticated && accessToken) {
        setIsVerifying(false);
        return;
      }

      // 2. Try to restore from storage/cookie
      const stored = getStoredSession();
      if (stored && stored.accessToken) {
        dispatch(setSession(stored));
        setIsVerifying(false);
        return;
      }

      // 3. Fallback: try refresh token API call
      try {
        const response = await apiClient.post(endpoints.auth.refreshToken);
        const authData = response.data?.data;
        if (!authData?.user) {
          throw new Error('No user data');
        }
        
        const userRoles: UserRole[] = authData.user.roles || ['student'];
        dispatch(setSession({
          userId: authData.user.id,
          displayName: authData.user.name,
          roles: userRoles,
          activeRole: userRoles[0],
          accessToken: authData.access_token,
        }));
      } catch {
        dispatch(clearSession());
        router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [isAuthenticated, accessToken, dispatch, router, pathname]);

  if (isVerifying) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress size={44} thickness={4} />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}>
          Memverifikasi sesi Anda...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = roles.some((role) => allowedRoles.includes(role)) || (activeRole && allowedRoles.includes(activeRole));
    if (!hasRole) {
      const returnUrl = getRoleDashboardUrl(activeRole);
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              maxWidth: 480,
              width: '100%',
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper'
            }}
          >
            <Box sx={{ width: 56, height: 56, mx: 'auto', mb: 2, borderRadius: '50%', bgcolor: 'error.light', color: 'error.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LockOutlinedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
              Akses Dibatasi
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Akun Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini dikhususkan untuk peran yang berwenang.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              href={returnUrl}
              sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 700 }}
            >
              Kembali ke Dashboard Saya
            </Button>
          </Paper>
        </Box>
      );
    }
  }

  return <>{children}</>;
}
