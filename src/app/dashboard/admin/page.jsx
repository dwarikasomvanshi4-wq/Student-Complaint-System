'use client';

import { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import Spinner from '@/components/ui/Spinner';
import axiosClient from '@/lib/axios';

/**
 * Admin Dashboard home page.
 *
 * Fetches complaint analytics from the server and displays:
 *   - 4 summary stat cards (total, open, resolved, rejected)
 *   - Bar chart of complaints by status
 *   - Bar chart of complaints by category
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get('/api/complaints/analytics')
      .then((res) => setAnalytics(res.data.analytics ?? res.data))
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, []);

  // Derive resolved / rejected counts from statusBreakdown
  const resolvedCount =
    analytics?.statusBreakdown?.find((s) => s.status === 'Resolved')?.count ?? 0;
  const rejectedCount =
    analytics?.statusBreakdown?.find((s) => s.status === 'Rejected')?.count ?? 0;

  // Map breakdown arrays to {name, value} shape expected by AnalyticsChart
  const statusChartData = (analytics?.statusBreakdown ?? []).map((s) => ({
    name: s.status,
    value: s.count,
  }));

  const categoryChartData = (analytics?.categoryBreakdown ?? []).map((c) => ({
    name: c.category,
    value: c.count,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <h1 className="text-xl font-semibold text-slate-800">Admin Dashboard</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              <StatsCard
                label="Total Complaints"
                value={analytics?.totalCount ?? 0}
                icon={FileText}
                color="indigo"
              />
              <StatsCard
                label="Open Complaints"
                value={analytics?.openCount ?? 0}
                icon={Clock}
                color="amber"
              />
              <StatsCard
                label="Resolved"
                value={resolvedCount}
                icon={CheckCircle}
                color="emerald"
              />
              <StatsCard
                label="Rejected"
                value={rejectedCount}
                icon={XCircle}
                color="red"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <AnalyticsChart
                data={statusChartData}
                title="Complaints by Status"
                type="bar"
              />
              <AnalyticsChart
                data={categoryChartData}
                title="Complaints by Category"
                type="bar"
                color="#10b981"
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
