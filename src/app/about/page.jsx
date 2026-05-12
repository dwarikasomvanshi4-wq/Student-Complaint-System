'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * About page — public, accessible without authentication.
 *
 * Requirements: 14.2, 13.4
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          About
        </h1>
        <p className="mt-6 text-base leading-7 text-slate-600">
          The Student Complaint System is a full-stack web platform designed to
          give students a clear, structured channel for raising concerns with
          their institution. Students can submit complaints across categories
          such as academics, hostel, transport, infrastructure, library,
          examination, and cafeteria. Admins manage the full complaint lifecycle
          — assigning cases to staff, tracking resolution progress, and
          reviewing analytics. Staff members handle the complaints assigned to
          them and record resolution notes once issues are addressed.
        </p>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Built with Next.js, MongoDB, and JWT-based authentication, the system
          prioritises security, transparency, and ease of use across all device
          sizes.
        </p>
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
