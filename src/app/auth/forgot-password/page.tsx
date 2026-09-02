import { Metadata } from 'next';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Lupa Kata Sandi | Naik Kelas',
  description: 'Pulihkan akun Naik Kelas Anda',
};

export default function ForgotPasswordPage() {
  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
      <ForgotPasswordForm />
    </Box>
  );
}
