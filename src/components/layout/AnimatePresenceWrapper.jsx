'use client';

import { AnimatePresence } from 'framer-motion';

/**
 * Thin client-side wrapper that enables Framer Motion AnimatePresence
 * for page transition animations. Must be a client component because
 * AnimatePresence uses React context internally.
 *
 * Requirements: 13.4
 */
export default function AnimatePresenceWrapper({ children }) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
