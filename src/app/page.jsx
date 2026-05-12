'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Search, BarChart2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

/**
 * Landing page — public, accessible without authentication.
 *
 * - Hero section with headline, subheadline, and CTA buttons.
 * - If the user is authenticated, shows a role-specific dashboard link
 *   instead of login/register buttons.
 * - Feature highlights section with three cards.
 *
 * Requirements: 14.1, 14.4, 14.5, 13.4
 */

const ROLE_DASHBOARD = {
  student: '/dashboard/student',
  admin: '/dashboard/admin',
  staff: '/dashboard/staff',
};

const FEATURES = [
  {
    icon: FileText,
    title: 'Submit Complaints',
    description:
      'Easily file complaints across categories like academics, hostel, transport, and more.',
  },
  {
    icon: Search,
    title: 'Track Progress',
    description:
      'Monitor the status of every complaint in real time — from Pending to Resolved.',
  },
  {
    icon: BarChart2,
    title: 'Admin Analytics',
    description:
      'Admins get a full analytics dashboard with breakdowns by status, category, and trends.',
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();

  const dashboardHref = user ? (ROLE_DASHBOARD[user.role] ?? '/dashboard') : null;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Hero ── */}
      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Student Complaint System
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            A modern platform for students to submit and track complaints.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {loading ? null : dashboardHref ? (
              <Link
                href={dashboardHref}
                className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-xl font-semibold text-slate-800 sm:text-2xl">
            Everything you need, in one place
          </h2>
          <div className="mt-8 grid gap-4 sm:gap-8 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
                className="flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6 text-center shadow-sm"
              >
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
        <nav className="flex justify-center gap-6">
          <Link href="/about" className="hover:text-indigo-600 transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-indigo-600 transition-colors">
            Contact
          </Link>
        </nav>
        <p className="mt-2">&copy; {new Date().getFullYear()} Student Complaint System</p>
      </footer>
    </main>
  );
}
