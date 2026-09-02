'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import { Google } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setSession } from '@/store/slices/authSlice';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import { getRoleDashboardUrl } from '@/lib/utils/role';
import { DynamicForm, FormConfig } from '@/components/dynamic-form';
import type { UserRole } from '@/types/domain';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const dispatch = useDispatch();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleNotice, setGoogleNotice] = useState(false);

  const loginFormConfig: FormConfig = {
    submitLabel: 'Masuk Sekarang',
    fields: [
      {
        name: 'email',
        label: 'Alamat Email',
        type: 'email',
        placeholder: 'Masukkan email Anda',
        validation: {
          required: true,
          requiredMessage: 'Alamat email wajib diisi',
          patternMessage: 'Format email tidak valid'
        }
      },
      {
        name: 'password',
        label: 'Kata Sandi',
        type: 'password',
        placeholder: 'Masukkan kata sandi Anda',
        validation: {
          required: true,
          requiredMessage: 'Kata sandi wajib diisi'
        }
      }
    ]
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const response = await apiClient.post(endpoints.auth.login, {
        email: data.email as string,
        password: data.password as string,
      });

      const authData = response.data?.data;
      if (!authData?.user) {
        throw new Error("Gagal memproses data otentikasi");
      }
      
      const roles: UserRole[] = authData.user.roles || ["student"];
      const activeRole: UserRole = roles[0] || "student";

      dispatch(setSession({
        userId: authData.user.id,
        displayName: authData.user.name,
        roles,
        activeRole,
        accessToken: authData.access_token,
      }));

      // Redirect to appropriate role dashboard or requested redirect path
      const defaultDashboard = getRoleDashboardUrl(activeRole);
      const targetUrl =
        redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('/auth')
          ? redirectParam
          : defaultDashboard;
      router.push(targetUrl);

    } catch (err: unknown) {
      setGlobalError(getApiErrorMessage(err, "Email atau kata sandi tidak valid. Silakan coba lagi."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        width: '100%',
        maxWidth: 460,
        mx: 'auto'
      }}
    >
      <Box sx={{ mb: 2.5, textAlign: 'left' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: 'text.primary' }} gutterBottom>
          Selamat Datang Kembali
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Masuk untuk melanjutkan perjalanan belajarmu.
        </Typography>
      </Box>

      <DynamicForm 
        config={loginFormConfig} 
        onSubmit={onSubmit} 
        isLoading={isLoading} 
        globalError={globalError}
        submitButtonSx={{ 
          bgcolor: 'primary.main',
          color: '#ffffff',
          '&:hover': { bgcolor: 'primary.dark' },
          py: 1.3,
          fontWeight: 700,
        }}
        extraActions={
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Link href="/auth/forgot-password" style={{ textDecoration: 'none' }}>
              <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}>
                Lupa Kata Sandi?
              </Typography>
            </Link>
          </Box>
        }
      />

      <Box sx={{ mt: 3, mb: 2, position: 'relative', textAlign: 'center' }}>
        <Divider>
          <Typography variant="caption" sx={{ color: 'text.secondary', px: 1, fontWeight: 600 }}>
            ATAU MASUK DENGAN
          </Typography>
        </Divider>
      </Box>

      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={<Google />}
        onClick={() => setGoogleNotice(true)}
        sx={{
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'text.primary',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'text.secondary',
          }
        }}
      >
        Google
      </Button>

      <Box sx={{ mt: 2.5, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Belum punya akun?{' '}
          <Link href="/auth/register" style={{ textDecoration: 'none' }}>
            <Typography component="span" variant="body2" sx={{ color: 'primary.main', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}>
              Daftar Akun
            </Typography>
          </Link>
        </Typography>
      </Box>

      <Snackbar
        open={googleNotice}
        autoHideDuration={4000}
        onClose={() => setGoogleNotice(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setGoogleNotice(false)} severity="info" sx={{ width: '100%' }}>
          Integrasi Google OAuth sedang disiapkan untuk rilis berikutnya.
        </Alert>
      </Snackbar>
    </Paper>
  );
}
