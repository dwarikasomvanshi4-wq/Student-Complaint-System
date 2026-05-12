'use client';

import { useRouter } from 'next/navigation';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import ComplaintCard from '@/components/dashboard/ComplaintCard';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/shared/EmptyState';
import { useComplaints } from '@/hooks/useComplaints';

/** Open statuses per requirements 5.2 */
const OPEN_STATUSES = ['Pending', 'Under Review', 'In Progress'];

/**
 * Student Dashboard home page.
 *
 * Displays summary stats and the 5 most recent complaints for the
 * authenticated student.
 *
 * Requirements: 5.2, 5.3
 */
export default function StudentDashboardPage() {
  const router = useRouter();
  const { complaints, loading } = useComplaints();

  // Derived counts
  const totalCount = complaints.length;
  const openCount = complaints.filter((c) => OPEN_STATUSES.includes(c.status)).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  // 5 most recent complaints (newest first)
  const recentComplaints = [...complaints]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const handleView = (complaint) => {
    router.push(`/dashboard/student/complaints/${complaint._id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <h1 className="text-xl font-semibold text-slate-800">Dashboard</h1>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
          <StatsCard
            label="Total Complaints"
            value={totalCount}
            icon={FileText}
            color="indigo"
          />
          <StatsCard
            label="Open Complaints"
            value={openCount}
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

        {/* Recent complaints section */}
        <section aria-labelledby="recent-complaints-heading">
          <h2
            id="recent-complaints-heading"
            className="mb-3 text-base font-semibold text-slate-700"
          >
            Recent Complaints
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" className="text-indigo-600" />
            </div>
          ) : recentComplaints.length === 0 ? (
            <EmptyState
              title="No complaints yet"
              description="You haven't submitted any complaints. Use the 'New Complaint' link to get started."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentComplaints.map((complaint) => (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  onView={handleView}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
