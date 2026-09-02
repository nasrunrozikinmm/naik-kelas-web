import { Suspense } from 'react';
import { Metadata } from 'next';
import LoginForm from '@/components/auth/LoginForm';
import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Login | Naik Kelas',
  description: 'Log in to your Naik Kelas account',
};

export default function LoginPage() {
  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </Box>
  );
}
