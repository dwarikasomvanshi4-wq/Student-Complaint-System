'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import { useUsers } from '@/hooks/useUsers';
import { adminUpdateUserSchema } from '@/validations/userSchemas';
import { formatDate } from '@/lib/utils';
import axiosClient from '@/lib/axios';

// Schema for creating a new admin/staff account
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'staff'], { message: 'Select admin or staff' }),
  department: z.string().min(1, 'Department is required').max(100),
});

const roleBadgeClass = (role) => {
  if (role === 'admin') return 'bg-indigo-100 text-indigo-700';
  if (role === 'staff') return 'bg-emerald-100 text-emerald-700';
  return 'bg-slate-100 text-slate-700';
};

const selectClass =
  'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 ' +
  'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 border-slate-300';

export default function AdminUsersPage() {
  const { users, loading, updateUser, fetchUsers } = useUsers();

  // ── Edit modal ──
  const [editTarget, setEditTarget] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm({ resolver: zodResolver(adminUpdateUserSchema) });

  const handleOpenEdit = (user) => {
    setEditTarget(user);
    resetEdit({ role: user.role ?? '', department: user.department ?? '' });
  };

  const handleCloseEdit = () => { setEditTarget(null); resetEdit(); };

  const onEditSubmit = async (data) => {
    setEditSubmitting(true);
    try {
      await updateUser(editTarget._id, data);
      await fetchUsers();
      toast.success('User updated successfully');
      handleCloseEdit();
    } catch {
      toast.error('Failed to update user');
    } finally {
      setEditSubmitting(false);
    }
  };

  // ── Create modal ──
  const [createOpen, setCreateOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors },
  } = useForm({ resolver: zodResolver(createUserSchema), defaultValues: { role: 'staff' } });

  const handleOpenCreate = () => { resetCreate({ role: 'staff' }); setCreateOpen(true); };
  const handleCloseCreate = () => { setCreateOpen(false); resetCreate(); };

  const onCreateSubmit = async (data) => {
    setCreateSubmitting(true);
    try {
      await axiosClient.post('/api/users/create', data);
      await fetchUsers();
      toast.success(`${data.role === 'admin' ? 'Admin' : 'Staff'} account created successfully`);
      handleCloseCreate();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">User Management</h1>
          <Button variant="primary" onClick={handleOpenCreate}>
            <UserPlus size={16} />
            Add Staff / Admin
          </Button>
        </div>

        {/* Table */}
        {loading && !users.length ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" className="text-indigo-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            No users found.
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden space-y-3">
              {users.map((user) => (
                <div key={user._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Button variant="ghost" className="text-xs px-2 py-1 flex-shrink-0" onClick={() => handleOpenEdit(user)}>
                      Edit
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                    {user.department && (
                      <span className="text-xs text-slate-500">{user.department}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Joined: {user.createdAt ? formatDate(user.createdAt) : '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['Name', 'Email', 'Role', 'Department', 'Joined', 'Actions'].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 text-left font-medium text-slate-600 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{user.name}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{user.department || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {user.createdAt ? formatDate(user.createdAt) : '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={() => handleOpenEdit(user)}>
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Edit modal ── */}
      <Modal isOpen={!!editTarget} onClose={handleCloseEdit} title={`Edit: ${editTarget?.name ?? ''}`}>
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="edit-role" className="text-sm font-medium text-slate-700">Role</label>
            <select id="edit-role" {...registerEdit('role')}
              className={selectClass + (editErrors.role ? ' border-red-500' : '')}>
              <option value="">— Select a role —</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
            </select>
            {editErrors.role && <p role="alert" className="text-xs text-red-500">{editErrors.role.message}</p>}
          </div>
          <Input id="edit-department" label="Department" placeholder="e.g. Computer Science"
            error={editErrors.department?.message} {...registerEdit('department')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleCloseEdit} disabled={editSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={editSubmitting}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* ── Create User modal ── */}
      <Modal isOpen={createOpen} onClose={handleCloseCreate} title="Add Staff / Admin Account">
        <form onSubmit={handleCreateSubmit(onCreateSubmit)} className="space-y-4" noValidate>
          <Input id="create-name" label="Full Name" type="text" placeholder="Jane Doe"
            error={createErrors.name?.message} {...registerCreate('name')} />
          <Input id="create-email" label="Email" type="email" placeholder="jane@example.com"
            error={createErrors.email?.message} {...registerCreate('email')} />
          <Input id="create-password" label="Password" type="password" placeholder="Min. 8 characters"
            error={createErrors.password?.message} {...registerCreate('password')} />
          <div className="flex flex-col gap-1">
            <label htmlFor="create-role" className="text-sm font-medium text-slate-700">Role</label>
            <select id="create-role" {...registerCreate('role')}
              className={selectClass + (createErrors.role ? ' border-red-500' : '')}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            {createErrors.role && <p role="alert" className="text-xs text-red-500">{createErrors.role.message}</p>}
          </div>
          <Input id="create-department" label="Department" type="text" placeholder="e.g. IT Support"
            error={createErrors.department?.message} {...registerCreate('department')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={handleCloseCreate} disabled={createSubmitting}>Cancel</Button>
            <Button type="submit" variant="primary" loading={createSubmitting}>Create Account</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
