'use client';

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/lib/axios';

/**
 * useComplaints — manages complaint data fetching and mutations.
 *
 * Provides CRUD operations for complaints via the /api/complaints endpoints.
 * Auto-fetches all accessible complaints on mount (role-filtered server-side).
 *
 * Returns:
 *   complaints  {Array}          — list of complaints for the current user's role
 *   loading     {boolean}        — true while any request is in flight
 *   error       {string|null}    — error message from the last failed request
 *   fetchComplaints(filters)     — GET /api/complaints with optional query params
 *   fetchComplaint(id)           — GET /api/complaints/{id}, returns the complaint
 *   createComplaint(data)        — POST /api/complaints, returns created complaint
 *   updateComplaint(id, data)    — PUT /api/complaints/{id}, returns updated complaint
 *   deleteComplaint(id)          — DELETE /api/complaints/{id}
 *
 * Requirements: 5.1, 6.1, 7.1
 */
export function useComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * fetchComplaints — GET /api/complaints with optional filters.
   *
   * @param {Object} [filters={}]
   * @param {string} [filters.status]
   * @param {string} [filters.category]
   * @param {string} [filters.priority]
   * @param {string} [filters.search]
   */
  const fetchComplaints = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from non-empty filter values
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.category) params.set('category', filters.category);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);

      const query = params.toString();
      const url = query ? `/api/complaints?${query}` : '/api/complaints';

      const { data } = await axiosClient.get(url);
      setComplaints(data.complaints ?? data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * fetchComplaint — GET /api/complaints/{id}.
   *
   * @param {string} id — complaint ID
   * @returns {Promise<Object>} the complaint object
   */
  const fetchComplaint = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get(`/api/complaints/${id}`);
      return data.complaint ?? data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * createComplaint — POST /api/complaints.
   *
   * @param {Object} complaintData — { title, description, category, priority, attachments? }
   * @returns {Promise<Object>} the created complaint
   */
  const createComplaint = useCallback(async (complaintData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.post('/api/complaints', complaintData);
      return data.complaint ?? data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * updateComplaint — PUT /api/complaints/{id}.
   *
   * @param {string} id — complaint ID
   * @param {Object} updates — fields to update (status, assignedTo, resolutionNote, priority)
   * @returns {Promise<Object>} the updated complaint
   */
  const updateComplaint = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.put(`/api/complaints/${id}`, updates);
      return data.complaint ?? data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * deleteComplaint — DELETE /api/complaints/{id}.
   *
   * @param {string} id — complaint ID
   */
  const deleteComplaint = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axiosClient.delete(`/api/complaints/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return {
    complaints,
    loading,
    error,
    fetchComplaints,
    fetchComplaint,
    createComplaint,
    updateComplaint,
    deleteComplaint,
  };
}
