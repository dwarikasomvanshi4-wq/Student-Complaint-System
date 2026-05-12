import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/context/AuthContext';
import AnimatePresenceWrapper from '@/components/layout/AnimatePresenceWrapper';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Student Complaint System',
  description: 'Submit and track student complaints',
};

/**
 * Root layout — Server Component.
 *
 * Wraps the entire application with:
 *   - AuthProvider  (session rehydration + auth context)
 *   - AnimatePresenceWrapper  (Framer Motion page transitions)
 *   - Toaster  (Sonner toast notifications)
 *
 * Requirements: 13.4, 13.5
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <AnimatePresenceWrapper>
            {children}
          </AnimatePresenceWrapper>
          {/* Toast notifications — positioned top-right */}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
