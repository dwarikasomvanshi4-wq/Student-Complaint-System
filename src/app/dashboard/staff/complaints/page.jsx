'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/shared/EmptyState';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { useComplaints } from '@/hooks/useComplaints';
import { STAFF_ALLOWED_STATUSES } from '@/constants/statuses';
import { formatDate, truncate } from '@/lib/utils';

/**
 * Staff assigned complaints page.
 *
 * Lists all complaints assigned to the authenticated staff member and
 * provides inline status update controls with resolution note support.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export default function StaffComplaintsPage() {
  const { complaints, loading, updateComplaint } = useComplaints();

  // Per-complaint inline form state: { [complaintId]: { status, resolutionNote, saving, error } }
  const [formState, setFormState] = useState({});

  /**
   * Returns the current inline form state for a given complaint,
   * falling back to the complaint's current values.
   */
  const getForm = (complaint) =>
    formState[complaint._id] ?? {
      status: complaint.status,
      resolutionNote: complaint.resolutionNote ?? '',
      saving: false,
      error: null,
    };

  const setForm = (id, patch) =>
    setFormState((prev) => ({
      ...prev,
      [id]: { ...getFormById(id, prev), ...patch },
    }));

  const getFormById = (id, state) =>
    state[id] ?? {
      status: '',
      resolutionNote: '',
      saving: false,
      error: null,
    };

  const handleStatusChange = (complaint, value) => {
    setForm(complaint._id, { status: value, error: null });
  };

  const handleNoteChange = (complaint, value) => {
    setForm(complaint._id, { resolutionNote: value, error: null });
  };

  const handleSave = async (complaint) => {
    const form = getForm(complaint);
    const { status, resolutionNote } = form;

    // Requirement 7.4: resolution note required when marking Resolved
    if (status === 'Resolved' && !resolutionNote.trim()) {
      setForm(complaint._id, {
        error: 'A resolution note is required when marking a complaint as Resolved.',
      });
      return;
    }

    setForm(complaint._id, { saving: true, error: null });
    try {
      await updateComplaint(complaint._id, { status, resolutionNote: resolutionNote.trim() });
      toast.success('Complaint updated successfully');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update complaint';
      toast.error(message);
      setForm(complaint._id, { saving: false, error: message });
      return;
    }
    setForm(complaint._id, { saving: false });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page heading */}
        <h1 className="text-xl font-semibold text-slate-800">My Assigned Complaints</h1>

        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : complaints.length === 0 ? (
          /* Empty state */
          <EmptyState
            title="No complaints assigned"
            description="You have no complaints assigned to you at the moment."
          />
        ) : (
          /* Complaint cards */
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const form = getForm(complaint);
              const isResolved = form.status === 'Resolved';

              return (
                <Card key={complaint._id} className="space-y-4">
                  {/* Complaint header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base font-semibold text-slate-800 truncate">
                        {complaint.title}
                      </h2>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {complaint.category} &middot; Submitted {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={complaint.status} />
                      <PriorityBadge priority={complaint.priority} />
                    </div>
                  </div>

                  {/* Description (truncated) */}
                  <p className="text-sm text-slate-600">
                    {truncate(complaint.description, 200)}
                  </p>

                  {/* Divider */}
                  <hr className="border-slate-200" />

                  {/* Inline update section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-slate-700">Update Status</h3>

                    {/* Status select */}
                    <div>
                      <label
                        htmlFor={`status-${complaint._id}`}
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id={`status-${complaint._id}`}
                        value={form.status}
                        onChange={(e) => handleStatusChange(complaint, e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        {STAFF_ALLOWED_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Resolution note textarea */}
                    <div>
                      <label
                        htmlFor={`note-${complaint._id}`}
                        className="block text-xs font-medium text-slate-600 mb-1"
                      >
                        Resolution Note{isResolved && <span className="text-red-500 ml-0.5">*</span>}
                      </label>
                      <textarea
                        id={`note-${complaint._id}`}
                        value={form.resolutionNote}
                        onChange={(e) => handleNoteChange(complaint, e.target.value)}
                        rows={3}
                        placeholder={
                          isResolved
                            ? 'Required: describe how this complaint was resolved…'
                            : 'Optional: add a note about the current progress…'
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                      />
                    </div>

                    {/* Validation error */}
                    {form.error && (
                      <p className="text-xs text-red-600" role="alert">
                        {form.error}
                      </p>
                    )}

                    {/* Save button */}
                    <div className="flex justify-end">
                      <Button
                        variant="primary"
                        loading={form.saving}
                        onClick={() => handleSave(complaint)}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
