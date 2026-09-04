'use client';

import React, { useState, Suspense } from 'react';
import { Divider } from '@mui/material';
import { Google, School, Psychology } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setSession } from '@/store/slices/authSlice';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { getApiErrorMessage } from '@/lib/utils/api-error';
import { getRoleDashboardUrl } from '@/lib/utils/role';
import { DynamicForm, FormConfig } from '@/components/dynamic-form';
import { useDialog } from '@/hooks/useConfirm';
import type { UserRole } from '@/types/domain';
import * as z from 'zod';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { alert } = useDialog();
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const roleParam = searchParams.get('role');
  const activeRole: 'student' | 'talent' = roleParam === 'talent' ? 'talent' : 'student';

  const handleRoleChange = (role: 'student' | 'talent') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('role', role);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const registerFormConfig: FormConfig = {
    submitLabel: activeRole === 'talent' ? 'Daftar sebagai Talent' : 'Daftar sebagai Siswa',
    // Custom schema needed because we have password confirmation logic
    customSchema: z.object({
      role: z.enum(['student', 'talent']),
      name: z.string().min(2, { message: "Nama terlalu pendek" }),
      email: z.string().email({ message: "Format email tidak valid" }),
      password: z.string().min(8, { message: "Kata sandi minimal 8 karakter" }),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Kata sandi tidak sama",
      path: ["confirmPassword"],
    }),
    fields: [
      {
        name: 'role',
        label: 'Pilih Peran Anda',
        type: 'custom',
        defaultValue: activeRole,
        render: ({ field }) => (
          <div className="w-full">
            <label className="block text-xs font-semibold text-on-surface mb-2">
              Pilih Peran Anda <span className="text-[#ba1a1a] font-bold">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  field.onChange('student');
                  handleRoleChange('student');
                }}
                className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  (field.value || 'student') === 'student'
                    ? 'border-primary bg-primary/5 text-primary shadow-xs'
                    : 'border-outline-variant/40 hover:border-primary/40 bg-surface-container-lowest text-on-surface-variant'
                }`}
              >
                <School sx={{ fontSize: 30, color: (field.value || 'student') === 'student' ? 'primary.main' : 'text.secondary', mb: 0.5 }} />
                <span className={`text-sm font-bold block ${
                  (field.value || 'student') === 'student' ? 'text-primary' : 'text-on-surface'
                }`}>
                  Siswa
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5">Ingin Belajar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  field.onChange('talent');
                  handleRoleChange('talent');
                }}
                className={`p-3.5 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  field.value === 'talent'
                    ? 'border-[#fd761a] bg-[#fd761a]/10 text-[#9d4300] shadow-xs'
                    : 'border-outline-variant/40 hover:border-[#fd761a]/40 bg-surface-container-lowest text-on-surface-variant'
                }`}
              >
                <Psychology sx={{ fontSize: 30, color: field.value === 'talent' ? '#fd761a' : 'text.secondary', mb: 0.5 }} />
                <span className={`text-sm font-bold block ${
                  field.value === 'talent' ? 'text-[#9d4300]' : 'text-on-surface'
                }`}>
                  Talent
                </span>
                <span className="text-[11px] text-on-surface-variant mt-0.5">Ingin Mengajar</span>
              </button>
            </div>
          </div>
        )
      },
      {
        name: 'name',
        label: 'Nama Lengkap',
        type: 'text',
        placeholder: 'Masukkan nama lengkap',
        validation: {
          required: true,
          requiredMessage: 'Nama lengkap wajib diisi'
        }
      },
      {
        name: 'email',
        label: 'Alamat Email',
        type: 'email',
        placeholder: 'Masukkan email Anda',
        validation: {
          required: true,
          requiredMessage: 'Alamat email wajib diisi',
          pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          patternMessage: 'Format email tidak valid'
        }
      },
      {
        name: 'password',
        label: 'Kata Sandi',
        type: 'password',
        placeholder: 'Minimal 8 karakter',
        validation: {
          required: true,
          requiredMessage: 'Kata sandi wajib diisi'
        }
      },
      {
        name: 'confirmPassword',
        label: 'Konfirmasi Kata Sandi',
        type: 'password',
        placeholder: 'Ketik ulang kata sandi',
        validation: {
          required: true,
          requiredMessage: 'Konfirmasi kata sandi wajib diisi'
        }
      }
    ]
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true);
    setGlobalError('');
    try {
      const response = await apiClient.post(endpoints.auth.register, {
        name: data.name as string,
        email: data.email as string,
        password: data.password as string,
        role: activeRole,
      });

      const authData = response.data?.data;
      if (!authData?.user) {
        throw new Error("Gagal memproses pendaftaran");
      }

      const roles: UserRole[] = authData.user.roles || [data.role as UserRole];
      const role: UserRole = roles[0] || (data.role as UserRole);

      dispatch(setSession({
        userId: authData.user.id,
        displayName: authData.user.name,
        roles,
        activeRole: role,
        accessToken: authData.access_token,
      }));

      router.push(getRoleDashboardUrl(role));

    } catch (error: unknown) {
      setGlobalError(getApiErrorMessage(error, 'Pendaftaran gagal. Silakan periksa kembali data Anda.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-xs p-6 sm:p-8 w-full max-w-[460px] mx-auto">
      <div className="mb-5 text-left">
        <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
          Buat Akun Baru
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          {activeRole === 'talent' 
            ? 'Daftar sebagai mentor/talent untuk membagikan keahlianmu.' 
            : 'Bergabung dengan ribuan siswa dan raih impian akademikmu.'}
        </p>
      </div>

      <DynamicForm 
        config={registerFormConfig} 
        onSubmit={onSubmit} 
        isLoading={isLoading} 
        globalError={globalError}
        submitButtonSx={{ 
          bgcolor: activeRole === 'talent' ? '#fd761a' : 'primary.main', 
          color: '#ffffff',
          '&:hover': { bgcolor: activeRole === 'talent' ? '#ea580c' : 'primary.dark' },
          fontFamily: 'Plus Jakarta Sans, sans-serif',
          py: 1.3,
          mt: 2,
          borderRadius: 2,
          fontWeight: 700,
          boxShadow: activeRole === 'talent' 
            ? '0 4px 14px 0 rgba(253, 118, 26, 0.35)' 
            : '0 4px 14px 0 rgba(0, 63, 177, 0.35)'
        }}
      />

      <div className="mt-5 mb-3 relative text-center">
        <Divider>
          <span className="text-[11px] font-bold text-on-surface-variant px-2 uppercase tracking-wider">
            ATAU DAFTAR DENGAN
          </span>
        </Divider>
      </div>

      <button
        type="button"
        onClick={() => alert({
          title: 'Segera Hadir',
          message: 'Pendaftaran menggunakan akun Google OAuth sedang dalam tahap penyiapan untuk rilis mendatang.',
          okLabel: 'Mengerti'
        })}
        className="w-full py-2.5 px-4 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-on-surface shadow-xs"
      >
        <Google fontSize="small" />
        <span>Google</span>
      </button>

      <div className="mt-4 text-center text-xs sm:text-sm text-on-surface-variant">
        Sudah punya akun?{' '}
        <Link href="/auth/login" className="text-primary font-bold hover:underline">
          Masuk Sekarang
        </Link>
      </div>
    </div>
  );
}

export default function RegisterForm() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-on-surface-variant">Memuat formulir...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
