'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema } from '@/validations/authSchemas';
import axiosClient from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

/**
 * Login form component with email/password fields, validation, and loading state.
 *
 * Requirements: 1.3, 11.1, 13.5
 *
 * @param {function} onSuccess - Called with user data on successful login
 * @param {string} [className] - Additional CSS classes for the form wrapper
 */
export default function LoginForm({ onSuccess, className }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      const response = await axiosClient.post('/api/auth/login', data);
      onSuccess(response.data.user);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-4', className)}
      noValidate
    >
      <Input
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Input
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        Sign In
      </Button>
    </form>
  );
}
