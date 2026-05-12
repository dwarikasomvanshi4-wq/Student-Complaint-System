'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ComplaintForm from '@/components/forms/ComplaintForm';

/**
 * Submit a Complaint page for students.
 *
 * Renders the ComplaintForm and on successful submission shows a toast
 * notification and redirects to the student's complaint history.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */
export default function NewComplaintPage() {
  const router = useRouter();

  function handleSuccess() {
    toast.success('Complaint submitted successfully.');
    router.push('/dashboard/student/complaints');
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-slate-800">Submit a Complaint</h1>

        <div className="max-w-2xl">
          <ComplaintForm onSuccess={handleSuccess} />
        </div>
      </div>
    </DashboardLayout>
  );
}
