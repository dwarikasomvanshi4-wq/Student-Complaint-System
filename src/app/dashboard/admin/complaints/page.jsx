'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ComplaintTable from '@/components/dashboard/ComplaintTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import StatusBadge from '@/components/shared/StatusBadge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { useComplaints } from '@/hooks/useComplaints';
import { useUsers } from '@/hooks/useUsers';
import { STATUSES } from '@/constants/statuses';
import { CATEGORIES } from '@/constants/categories';
import { formatDate } from '@/lib/utils';

const PRIORITIES = ['Low', 'Medium', 'High'];

export default function AdminComplaintsPage() {
  const { complaints, loading, updateComplaint, deleteComplaint, fetchComplaints } =
    useComplaints();
  const { users } = useUsers();

  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Edit modal state
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Assign modal state
  const [assignTarget, setAssignTarget] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // View modal state
  const [viewTarget, setViewTarget] = useState(null);

  const staffUsers = users.filter((u) => u.role === 'staff');

  // Client-side filtering
  const filtered = complaints.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (categoryFilter && c.category !== categoryFilter) return false;
    if (priorityFilter && c.priority !== priorityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = c.title?.toLowerCase().includes(q);
      const studentName =
        typeof c.studentId === 'object'
          ? c.studentId?.name?.toLowerCase().includes(q)
          : false;
      if (!titleMatch && !studentName) return false;
    }
    return true;
  });

  // --- View handlers ---
  const handleOpenView = (complaint) => setViewTarget(complaint);
  const handleCloseView = () => setViewTarget(null);

  // --- Edit handlers ---
  const handleOpenEdit = (complaint) => {
    setEditTarget(complaint);
    setEditForm({
      status: complaint.status ?? '',
      priority: complaint.priority ?? 'Medium',
      assignedTo: complaint.assignedTo?._id ?? complaint.assignedTo ?? '',
      resolutionNote: complaint.resolutionNote ?? '',
    });
  };

  const handleCloseEdit = () => {
    setEditTarget(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (editForm.status === 'Resolved' && !editForm.resolutionNote?.trim()) {
      toast.error('Resolution note is required when marking as Resolved');
      return;
    }
    setSaving(true);
    try {
      const updates = {
        status: editForm.status,
        priority: editForm.priority,
        resolutionNote: editForm.resolutionNote || undefined,
      };
      if (editForm.assignedTo) updates.assignedTo = editForm.assignedTo;
      await updateComplaint(editTarget._id, updates);
      toast.success('Complaint updated successfully');
      handleCloseEdit();
      fetchComplaints();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update complaint');
    } finally {
      setSaving(false);
    }
  };

  // --- Assign handlers ---
  const handleOpenAssign = (complaint) => {
    setAssignTarget(complaint);
    setSelectedStaffId(complaint.assignedTo?._id ?? complaint.assignedTo ?? '');
  };

  const handleCloseAssign = () => {
    setAssignTarget(null);
    setSelectedStaffId('');
  };

  const handleConfirmAssign = async () => {
    if (!selectedStaffId) return;
    setAssigning(true);
    try {
      await updateComplaint(assignTarget._id, { assignedTo: selectedStaffId });
      toast.success('Complaint assigned successfully');
      handleCloseAssign();
      fetchComplaints();
    } catch {
      toast.error('Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  // --- Delete handlers ---
  const handleOpenDelete = (complaint) => setDeleteTarget(complaint);
  const handleCloseDelete = () => setDeleteTarget(null);

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteComplaint(deleteTarget._id);
      toast.success('Complaint deleted successfully');
      handleCloseDelete();
      fetchComplaints();
    } catch {
      toast.error('Failed to delete complaint');
    } finally {
      setDeleting(false);
    }
  };

  const selectClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-slate-800">Complaint Management</h1>

        {/* Filter controls */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {Object.values(STATUSES).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="col-span-2 sm:col-span-1 sm:flex-1 sm:min-w-[200px] sm:max-w-sm rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Complaint table */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : (
          <ComplaintTable
            complaints={filtered}
            onView={handleOpenView}
            onEdit={handleOpenEdit}
            onAssign={handleOpenAssign}
            onDelete={handleOpenDelete}
          />
        )}
      </div>

      {/* ── View modal ── */}
      <Modal isOpen={!!viewTarget} onClose={handleCloseView} title="Complaint Details">
        {viewTarget && (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={viewTarget.status} />
              <PriorityBadge priority={viewTarget.priority} />
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                {viewTarget.category}
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-800">{viewTarget.title}</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{viewTarget.description}</p>
            {viewTarget.resolutionNote && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <p className="text-xs font-semibold text-emerald-700 mb-1">Resolution Note</p>
                <p className="text-emerald-800 text-sm whitespace-pre-wrap">{viewTarget.resolutionNote}</p>
              </div>
            )}
            <p className="text-xs text-slate-400">
              Submitted: {viewTarget.createdAt ? formatDate(viewTarget.createdAt) : '—'}
            </p>
          </div>
        )}
      </Modal>

      {/* ── Edit modal ── */}
      <Modal isOpen={!!editTarget} onClose={handleCloseEdit} title="Edit Complaint">
        {editTarget && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700 truncate">{editTarget.title}</p>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className={selectClass}
              >
                {Object.values(STATUSES).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}
                className={selectClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Assign to staff */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assign to Staff</label>
              <select
                value={editForm.assignedTo}
                onChange={(e) => setEditForm((f) => ({ ...f, assignedTo: e.target.value }))}
                className={selectClass}
              >
                <option value="">— Unassigned —</option>
                {staffUsers.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}{s.department ? ` (${s.department})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Resolution note */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Resolution Note{editForm.status === 'Resolved' && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              <textarea
                rows={3}
                value={editForm.resolutionNote}
                onChange={(e) => setEditForm((f) => ({ ...f, resolutionNote: e.target.value }))}
                placeholder={editForm.status === 'Resolved' ? 'Required for Resolved status…' : 'Optional note…'}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={handleCloseEdit} disabled={saving}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Assign modal ── */}
      <Modal isOpen={!!assignTarget} onClose={handleCloseAssign} title="Assign Complaint">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Assign <span className="font-medium text-slate-800">{assignTarget?.title}</span> to a staff member.
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Staff Member</label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className={selectClass}
            >
              <option value="">— Choose a staff member —</option>
              {staffUsers.map((staff) => (
                <option key={staff._id} value={staff._id}>
                  {staff.name}{staff.department ? ` (${staff.department})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleCloseAssign} disabled={assigning}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmAssign} loading={assigning} disabled={!selectedStaffId}>
              Assign
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete modal ── */}
      <Modal isOpen={!!deleteTarget} onClose={handleCloseDelete} title="Delete Complaint">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete{' '}
            <span className="font-medium text-slate-800">{deleteTarget?.title}</span>? This cannot be undone.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={handleCloseDelete} disabled={deleting}>Cancel</Button>
            <Button variant="danger" onClick={handleConfirmDelete} loading={deleting}>Delete</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
