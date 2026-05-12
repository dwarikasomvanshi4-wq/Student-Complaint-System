'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createComplaintSchema } from '@/validations/complaintSchemas';
import { CATEGORIES } from '@/constants/categories';
import axiosClient from '@/lib/axios';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

/**
 * Complaint form for creating or editing a complaint.
 * When `initialData` is provided the form operates in edit mode and issues a PUT request.
 *
 * Requirements: 4.2, 11.1, 13.5
 *
 * @param {function} onSuccess - Called with the complaint data on success
 * @param {object} [initialData] - Existing complaint data for edit mode
 * @param {string} [className] - Additional CSS classes for the form wrapper
 */
export default function ComplaintForm({ onSuccess, initialData, className }) {
  const isEditMode = Boolean(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: initialData
      ? {
          title: initialData.title ?? '',
          description: initialData.description ?? '',
          category: initialData.category ?? CATEGORIES[0],
          priority: initialData.priority ?? 'Medium',
        }
      : {
          priority: 'Medium',
        },
  });

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      let response;
      if (isEditMode) {
        response = await axiosClient.put(
          `/api/complaints/${initialData._id}`,
          data
        );
        toast.success('Complaint updated successfully.');
      } else {
        response = await axiosClient.post('/api/complaints', data);
        toast.success('Complaint submitted successfully.');
      }
      onSuccess(response.data.complaint);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (isEditMode
          ? 'Failed to update complaint. Please try again.'
          : 'Failed to submit complaint. Please try again.');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('flex flex-col gap-4', className)}
      noValidate
    >
      <Input
        id="title"
        label="Title"
        type="text"
        placeholder="Brief summary of your complaint"
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="flex flex-col gap-1">
        <label
          htmlFor="description"
          className="text-sm font-medium text-slate-700"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={5}
          placeholder="Describe your complaint in detail…"
          aria-invalid={errors.description ? 'true' : undefined}
          aria-describedby={errors.description ? 'description-error' : undefined}
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
            'placeholder:text-slate-400 resize-y',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            errors.description
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300'
          )}
          {...register('description')}
        />
        {errors.description && (
          <p id="description-error" role="alert" className="text-xs text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-slate-700">
          Category
        </label>
        <select
          id="category"
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            errors.category
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300'
          )}
          {...register('category')}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p id="category-error" role="alert" className="text-xs text-red-500">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="priority" className="text-sm font-medium text-slate-700">
          Priority
        </label>
        <select
          id="priority"
          className={cn(
            'w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
            errors.priority
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300'
          )}
          {...register('priority')}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        {errors.priority && (
          <p id="priority-error" role="alert" className="text-xs text-red-500">
            {errors.priority.message}
          </p>
        )}
      </div>

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        {isEditMode ? 'Update Complaint' : 'Submit Complaint'}
      </Button>
    </form>
  );
}
