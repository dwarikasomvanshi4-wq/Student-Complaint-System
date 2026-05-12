'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ComplaintTable from '@/components/dashboard/ComplaintTable';
import Spinner from '@/components/ui/Spinner';
import { useComplaints } from '@/hooks/useComplaints';

/**
 * Student complaint history page.
 *
 * Lists all complaints submitted by the authenticated student with
 * client-side search filtering by title or category.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export default function StudentComplaintsPage() {
  const router = useRouter();
  const { complaints, loading } = useComplaints();
  const [search, setSearch] = useState('');

  // Client-side filter by title or category (requirement 5.4)
  const filtered = complaints.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
  });

  const handleView = (complaint) => {
    router.push(`/dashboard/student/complaints/${complaint._id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <h1 className="text-xl font-semibold text-slate-800">My Complaints</h1>

        {/* Search input */}
        <div className="max-w-sm">
          <label htmlFor="complaint-search" className="sr-only">
            Search complaints
          </label>
          <input
            id="complaint-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or category…"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : (
          <ComplaintTable complaints={filtered} onView={handleView} />
        )}
      </div>
    </DashboardLayout>
  );
}
