'use client';

import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/lib/axios';

/**
 * useUsers — manages user data fetching and mutations.
 *
 * Provides read and update operations for users via the /api/users endpoints.
 * Auto-fetches all users on mount (admin-only endpoint; non-admins will receive
 * a 403 which is surfaced in the error state).
 *
 * Returns:
 *   users       {Array}          — list of users
 *   loading     {boolean}        — true while any request is in flight
 *   error       {string|null}    — error message from the last failed request
 *   fetchUsers()                 — GET /api/users, updates users state
 *   fetchUser(id)                — GET /api/users/{id}, returns the user
 *   updateUser(id, data)         — PUT /api/users/{id}, returns updated user
 *
 * Requirements: 8.1, 9.2
 */
export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * fetchUsers — GET /api/users.
   * Updates the users state with the returned list.
   */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get('/api/users');
      setUsers(data.users ?? data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * fetchUser — GET /api/users/{id}.
   *
   * @param {string} id — user ID
   * @returns {Promise<Object>} the user object
   */
  const fetchUser = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.get(`/api/users/${id}`);
      return data.user ?? data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * updateUser — PUT /api/users/{id}.
   *
   * @param {string} id — user ID
   * @param {Object} updates — fields to update (name, department, profileImage, role)
   * @returns {Promise<Object>} the updated user object
   */
  const updateUser = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axiosClient.put(`/api/users/${id}`, updates);
      return data.user ?? data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser,
    updateUser,
  };
}
