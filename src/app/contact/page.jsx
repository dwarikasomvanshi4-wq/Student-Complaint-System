'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import Link from 'next/link';

/**
 * Contact page — public, accessible without authentication.
 *
 * Requirements: 14.3, 13.4
 */
export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Contact
        </h1>
        <p className="mt-6 text-base leading-7 text-slate-600">
          Have a question or need support? Reach out to the system administrators
          using the contact details below.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <Mail size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-700">Email</p>
            <a
              href="mailto:support@university.edu"
              className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              support@university.edu
            </a>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
