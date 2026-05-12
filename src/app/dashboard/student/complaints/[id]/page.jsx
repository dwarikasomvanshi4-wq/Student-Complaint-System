'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Paperclip } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Spinner from '@/components/ui/Spinner';
import Card from '@/components/ui/Card';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { useComplaints } from '@/hooks/useComplaints';
import { formatDate } from '@/lib/utils';

/**
 * Student complaint detail page.
 *
 * Displays the full details of a single complaint including description,
 * status, priority, resolution note, attachments, and submission date.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */
export default function StudentComplaintDetailPage() {
  // useParams() is the correct client-component pattern for App Router
  const { id } = useParams();
  const { fetchComplaint } = useComplaints();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const data = await fetchComplaint(id);
        if (!cancelled) {
          if (data) {
            setComplaint(data);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id, fetchComplaint]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back navigation */}
        <Link
          href="/dashboard/student/complaints"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to My Complaints
        </Link>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        )}

        {/* Not found state */}
        {!loading && notFound && (
          <Card className="py-16 text-center">
            <p className="text-lg font-semibold text-slate-700">Complaint not found</p>
            <p className="mt-1 text-sm text-slate-500">
              The complaint you are looking for does not exist or you do not have access to it.
            </p>
          </Card>
        )}

        {/* Complaint detail */}
        {!loading && complaint && (
          <Card className="space-y-6">
            {/* Title + badges */}
            <div className="space-y-3">
              <h1 className="text-xl font-semibold text-slate-800 leading-snug">
                {complaint.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={complaint.status} />
                <PriorityBadge priority={complaint.priority} />
                <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2.5 py-0.5">
                  {complaint.category}
                </span>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Description */}
            <section aria-labelledby="description-heading">
              <h2
                id="description-heading"
                className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500"
              >
                Description
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </section>

            {/* Resolution note (if any) */}
            {complaint.resolutionNote && (
              <section aria-labelledby="resolution-heading">
                <h2
                  id="resolution-heading"
                  className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500"
                >
                  Resolution Note
                </h2>
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                  <p className="text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap">
                    {complaint.resolutionNote}
                  </p>
                </div>
              </section>
            )}

            {/* Attachments (if any) */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <section aria-labelledby="attachments-heading">
                <h2
                  id="attachments-heading"
                  className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500"
                >
                  Attachments
                </h2>
                <ul className="space-y-1">
                  {complaint.attachments.map((attachment, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-indigo-600">
                      <Paperclip className="h-4 w-4 flex-shrink-0 text-slate-400" aria-hidden="true" />
                      {typeof attachment === 'string' ? (
                        <span className="truncate">{attachment}</span>
                      ) : (
                        <span className="truncate">{attachment.name ?? attachment.url ?? attachment}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Metadata footer */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-400">
                Submitted on{' '}
                <time dateTime={complaint.createdAt}>
                  {complaint.createdAt ? formatDate(complaint.createdAt) : '—'}
                </time>
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
