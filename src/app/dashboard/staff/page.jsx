'use client';

import { ClipboardList, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import Spinner from '@/components/ui/Spinner';
import { useComplaints } from '@/hooks/useComplaints';

/**
 * Staff Dashboard home page.
 *
 * Displays summary stats for complaints assigned to the authenticated
 * staff member. Data is auto-fetched by useComplaints() on mount and
 * filtered server-side to only return complaints assigned to this user.
 *
 * Requirements: 7.1
 */
export default function StaffDashboardPage() {
  const { complaints, loading } = useComplaints();

  // Derived counts
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <h1 className="text-xl font-semibold text-slate-800">Staff Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
            <StatsCard
              label="Assigned Complaints"
              value={totalCount}
              icon={ClipboardList}
              color="indigo"
            />
            <StatsCard
              label="In Progress"
              value={inProgressCount}
              icon={Clock}
              color="amber"
            />
            <StatsCard
              label="Resolved"
              value={resolvedCount}
              icon={CheckCircle}
              color="emerald"
            />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
