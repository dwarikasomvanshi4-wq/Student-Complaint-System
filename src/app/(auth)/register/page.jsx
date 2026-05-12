'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import RegisterForm from '@/components/forms/RegisterForm';

/**
 * Register page — public, accessible without authentication.
 * On successful registration, logs the user in and redirects to the student dashboard.
 * New users are students by default.
 *
 * Requirements: 1.1, 14.5
 */
export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();

  function handleSuccess(userData) {
    login(userData);
    router.push('/dashboard/student');
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-8 sm:px-8 sm:py-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Fill in the details below to get started
            </p>
          </div>

          <RegisterForm onSuccess={handleSuccess} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
