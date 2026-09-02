'use client';

import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import { DynamicForm, FormConfig } from '@/components/dynamic-form';
import { ArrowBack } from '@mui/icons-material';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPasswordConfig: FormConfig = {
    submitLabel: 'Kirim Link Reset',
    fields: [
      {
        name: 'email',
        label: 'Alamat Email',
        type: 'email',
        placeholder: 'Masukkan email akun Anda',
        validation: {
          required: true,
          requiredMessage: 'Alamat email wajib diisi',
          patternMessage: 'Format email tidak valid'
        }
      }
    ]
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setGlobalError('');
    try {
      await apiClient.post(endpoints.auth.forgotPassword, { email: data.email as string });
      setIsSuccess(true);
      
      // Navigate to reset password page (in real app, user clicks email link)
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(data.email as string)}`);
      }, 2000);
    } catch (error: unknown) {
      setGlobalError(getApiErrorMessage(error, 'Gagal mengirim permintaan reset kata sandi.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 5 },
        borderRadius: 3,
        bgcolor: '#ffffff',
        border: '1px solid #e0e0e0',
        width: '100%',
        maxWidth: 480,
        mx: 'auto'
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'left' }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, color: '#111827', fontFamily: 'Plus Jakarta Sans, sans-serif' }} gutterBottom>
          Lupa Kata Sandi?
        </Typography>
        <Typography variant="body2" sx={{ color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
          Jangan khawatir! Masukkan email Anda dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi.
        </Typography>
      </Box>

      {isSuccess ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Cek Email Anda
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kami telah mengirimkan instruksi pemulihan ke email tersebut. Mengarahkan Anda ke halaman reset...
          </Typography>
        </Box>
      ) : (
        <DynamicForm 
          config={forgotPasswordConfig} 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
          globalError={globalError}
          submitButtonSx={{ 
            bgcolor: '#1a56db', 
            '&:hover': { bgcolor: '#1e40af' },
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            py: 1.5,
            mt: 1
          }}
        />
      )}

      <Box sx={{ mt: 1, textAlign: 'center' }}>
        <Link href="/auth/login" passHref style={{ textDecoration: 'none' }}>
          <Button 
            variant="text" 
            startIcon={<ArrowBack />}
            sx={{ 
              color: '#4B5563', 
              textTransform: 'none', 
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              '&:hover': { bgcolor: 'transparent', color: '#1a56db' }
            }}
          >
            Kembali ke Masuk
          </Button>
        </Link>
      </Box>
    </Paper>
  );
}
