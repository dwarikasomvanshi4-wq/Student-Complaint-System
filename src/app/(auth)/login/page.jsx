'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/forms/LoginForm';

/**
 * Login page — public, accessible without authentication.
 * On successful login, redirects the user to their role-specific dashboard.
 *
 * Requirements: 1.1, 2.1, 14.5
 */
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  function handleSuccess(userData) {
    login(userData);

    const roleRoutes = {
      admin: '/dashboard/admin',
      staff: '/dashboard/staff',
      student: '/dashboard/student',
    };

    const destination = roleRoutes[userData?.role] ?? '/dashboard/student';
    router.push(destination);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-8 sm:px-8 sm:py-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your dashboard
            </p>
          </div>

          <LoginForm onSuccess={handleSuccess} />
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
