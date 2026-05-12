/**
 * Shared utility functions for the Student Complaint System.
 *
 * Requirements: 2.4, 3.7
 */

/**
 * Merges class names, filtering out falsy values.
 *
 * @param {...string} classes - Class name strings or falsy values
 * @returns {string} Space-joined class string
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Formats a Date object or ISO date string to a human-readable date string.
 * Example output: "Jan 12, 2025"
 *
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Formats a Date object or ISO date string to a human-readable date and time string.
 * Example output: "Jan 12, 2025, 3:45 PM"
 *
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

/**
 * Truncates a string to the given maximum length, appending "..." if truncated.
 *
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum allowed length before truncation
 * @returns {string} Original string if within limit, otherwise truncated string with "..."
 */
export function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param {string} str - String to capitalize
 * @returns {string} String with first letter uppercased
 */
export function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
