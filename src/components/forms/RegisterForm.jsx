'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema } from '@/validations/authSchemas';
import axiosClient from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

/**
 * Registration form with name, email, password, role, and department fields.
 *
 * Requirements: 1.3, 11.1, 13.5
 *
 * @param {function} onSuccess - Called with user data on successful registration
 * @param {string} [className] - Additional CSS classes for the form wrapper
 */
export default function RegisterForm({ onSuccess, className }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student',
    },
  });

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      const response = await axiosClient.post('/api/auth/register', data);
      onSuccess(response.data.user);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please try again.';
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
        id="name"
        label="Full Name"
        type="text"
        placeholder="Jane Doe"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

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
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        id="department"
        label="Department"
        type="text"
        placeholder="e.g. Computer Science"
        autoComplete="organization"
        error={errors.department?.message}
        {...register('department')}
      />

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        Create Account
      </Button>
    </form>
  );
}
