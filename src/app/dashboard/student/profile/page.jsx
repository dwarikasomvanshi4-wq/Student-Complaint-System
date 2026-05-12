'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { User, Mail, Shield, Building2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { updateProfileSchema } from '@/validations/userSchemas';

/**
 * Student Profile page.
 *
 * Displays the authenticated student's current profile data and provides
 * an edit form to update name and department. On successful save the auth
 * context is refreshed so the rest of the UI reflects the new values.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
export default function StudentProfilePage() {
  const { user, loading: authLoading, login } = useAuth();
  const { updateUser, loading: updating } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      department: '',
    },
  });

  // Populate form once the authenticated user is available
  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        department: user.department ?? '',
      });
    }
  }, [user, reset]);

  async function onSubmit(data) {
    try {
      const updatedUser = await updateUser(user._id, data);
      // Sync the auth context so the navbar / sidebar reflect the new name
      login(updatedUser);
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile. Please try again.');
    }
  }

  // Show a centred spinner while the session is being rehydrated
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Spinner size="lg" className="text-indigo-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Page heading */}
        <h1 className="text-xl font-semibold text-slate-800">My Profile</h1>

        {/* Read-only profile info */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-700">
            Account Information
          </h2>

          <dl className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={18} className="flex-shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Name
                </dt>
                <dd className="text-sm text-slate-800">{user?.name ?? '—'}</dd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail size={18} className="flex-shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Email
                </dt>
                <dd className="text-sm text-slate-800">{user?.email ?? '—'}</dd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield size={18} className="flex-shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Role
                </dt>
                <dd className="text-sm text-slate-800 capitalize">{user?.role ?? '—'}</dd>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 size={18} className="flex-shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Department
                </dt>
                <dd className="text-sm text-slate-800">{user?.department ?? '—'}</dd>
              </div>
            </div>
          </dl>
        </Card>

        {/* Edit form */}
        <Card>
          <h2 className="mb-4 text-base font-semibold text-slate-700">
            Edit Profile
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <Input
              id="name"
              label="Full Name"
              type="text"
              placeholder="Your full name"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="department"
              label="Department"
              type="text"
              placeholder="e.g. Computer Science"
              autoComplete="organization"
              error={errors.department?.message}
              {...register('department')}
            />

            <div className="pt-2">
              <Button type="submit" loading={updating}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
