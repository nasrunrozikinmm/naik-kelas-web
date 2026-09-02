import { Suspense } from 'react';
import { Metadata } from 'next';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Box, CircularProgress } from '@mui/material';

export const metadata: Metadata = {
  title: 'Reset Kata Sandi | Naik Kelas',
  description: 'Atur ulang kata sandi akun Naik Kelas Anda',
};

export default function ResetPasswordPage() {
  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </Box>
  );
}
