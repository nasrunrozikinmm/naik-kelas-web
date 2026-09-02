import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';
import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Register | Naik Kelas',
  description: 'Create a new account on Naik Kelas',
};

export default function RegisterPage() {
  return (
    <Box sx={{ width: '100%', px: { xs: 2, md: 4 } }}>
      <RegisterForm />
    </Box>
  );
}
