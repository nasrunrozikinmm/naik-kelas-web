'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import { DynamicForm, FormConfig } from '@/components/dynamic-form';
import { ArrowBack } from '@mui/icons-material';
import * as z from 'zod';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const resetPasswordConfig: FormConfig = {
    submitLabel: 'Simpan Kata Sandi',
    customSchema: z.object({
      otp: z.string().regex(/^\d{6}$/, { message: "OTP harus terdiri dari 6 digit" }),
      password: z.string().min(8, { message: "Kata sandi minimal 8 karakter" }),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Kata sandi tidak sama",
      path: ["confirmPassword"],
    }),
    fields: [
      {
        name: 'otp',
        label: 'Kode OTP',
        type: 'text',
        placeholder: 'Masukkan 6 digit kode OTP',
        validation: {
          required: true,
          requiredMessage: 'Kode OTP wajib diisi',
        },
      },
      {
        name: 'password',
        label: 'Kata Sandi Baru',
        type: 'password',
        placeholder: 'Masukkan kata sandi baru',
      },
      {
        name: 'confirmPassword',
        label: 'Konfirmasi Kata Sandi',
        type: 'password',
        placeholder: 'Ketik ulang kata sandi',
      }
    ]
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setGlobalError('');
    try {
      await apiClient.post(endpoints.auth.resetPassword, {
        email: email,
        otp: data.otp as string,
        password: data.password as string,
      });

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: unknown) {
      setGlobalError(getApiErrorMessage(error, 'Gagal mereset kata sandi. Silakan coba lagi.'));
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
          Buat Kata Sandi Baru
        </Typography>
        <Typography variant="body2" sx={{ color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
          Silakan buat kata sandi baru untuk akun {email ? <strong>{email}</strong> : 'Anda'}.
        </Typography>
      </Box>

      {isSuccess ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            Berhasil Diperbarui!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Kata sandi Anda telah diperbarui. Mengarahkan ke halaman Masuk...
          </Typography>
        </Box>
      ) : (
        <DynamicForm 
          config={resetPasswordConfig} 
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

      <Box sx={{ mt: 4, textAlign: 'center' }}>
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
            Batal & Kembali ke Masuk
          </Button>
        </Link>
      </Box>
    </Paper>
  );
}
