# Implementation Plan: Student Complaint System

## Overview

Implement a production-ready full-stack Next.js web application with MongoDB, JWT authentication, and role-based access control for three user roles (Student, Admin, Staff). Tasks are ordered to build incrementally — foundation first, then API layer, then UI, then integration.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Next.js project with App Router and install all dependencies: `mongoose`, `bcryptjs`, `jsonwebtoken`, `zod`, `react-hook-form`, `@hookform/resolvers`, `axios`, `framer-motion`, `lucide-react`, `react-hot-toast`, `sonner`, `recharts`, `fast-check`
  - Create the full directory structure under `src/` as defined in the design: `app/`, `components/`, `lib/`, `models/`, `middleware/`, `hooks/`, `context/`, `services/`, `validations/`, `constants/`
  - Create `.env.example` with `MONGODB_URI`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL` placeholders
  - Create `next.config.js` with production-ready settings
  - Configure `tailwind.config.js` with the Indigo/Blue primary, Slate secondary, Emerald accent, and Red error color palette
  - _Requirements: 12.4, 13.3_

- [x] 2. Constants, validation schemas, and database layer
  - [x] 2.1 Create constants files
    - Write `src/constants/roles.js` exporting `ROLES` object
    - Write `src/constants/categories.js` exporting `CATEGORIES` array
    - Write `src/constants/statuses.js` exporting `STATUSES`, `OPEN_STATUSES`, and `STAFF_ALLOWED_STATUSES`
    - _Requirements: 4.5, 4.6, 7.2_

  - [x] 2.2 Create Zod validation schemas
    - Write `src/validations/authSchemas.js` with `registerSchema` and `loginSchema`
    - Write `src/validations/complaintSchemas.js` with `createComplaintSchema` and `updateComplaintSchema`
    - Write `src/validations/userSchemas.js` with `updateProfileSchema` and `adminUpdateUserSchema`
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ]* 2.3 Write property test for Zod validation rejection (Property 6)
    - **Property 6: Zod validation rejects malformed payloads with field-level errors**
    - Generate invalid payloads: titles >100 chars, descriptions >2000 chars, invalid emails, passwords <8 chars, missing required fields
    - Assert each schema parse returns a ZodError listing the failing field(s)
    - Assert no database write occurs when validation fails
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

  - [x] 2.4 Implement Mongoose connection singleton
    - Write `src/lib/db.js` with a cached Mongoose connection using `MONGODB_URI` env variable
    - On connection failure, log the error and exit the process with code 1
    - _Requirements: 12.1, 12.2_

  - [x] 2.5 Implement User and Complaint Mongoose models
    - Write `src/models/User.js` with the `UserSchema` (name, email, password with `select: false`, role, department, profileImage) and strict mode enabled
    - Write `src/models/Complaint.js` with the `ComplaintSchema` (title, description, category, status, priority, studentId, assignedTo, resolutionNote, attachments) and strict mode enabled
    - Add indexes: `email` unique on User; `studentId`, `assignedTo`, `status`, `category` on Complaint
    - _Requirements: 12.3, 4.1, 4.3_

- [x] 3. Authentication service and JWT utilities
  - [x] 3.1 Implement JWT helpers and auth service
    - Write `src/lib/jwt.js` with `signToken(payload)` and `verifyToken(token)` using `jsonwebtoken` and `JWT_SECRET` env variable
    - Write `src/services/authService.js` implementing `createUser`, `verifyCredentials`, `issueToken`, and `clearSession`
    - Hash passwords with bcryptjs at a minimum of 10 salt rounds
    - _Requirements: 1.1, 1.4, 2.1, 2.3_

  - [ ]* 3.2 Write property test for password hashing round-trip (Property 1)
    - **Property 1: Password hashing round-trip**
    - Generate random password strings of length ≥8 with `fc.string({ minLength: 8 })`
    - Assert `hash !== plaintext` and `bcrypt.compare(plaintext, hash) === true`
    - Assert the stored user record contains the hash, not the plaintext
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 3.3 Write property test for default role assignment (Property 2)
    - **Property 2: Default role assignment**
    - Generate registration payloads omitting the role field
    - Assert the created user record has `role === "student"`
    - **Validates: Requirements 1.5**

  - [ ]* 3.4 Write property test for HTTP-only JWT cookie on auth responses (Property 3)
    - **Property 3: Successful auth responses always set HTTP-only JWT cookie**
    - Generate valid registration and login payloads; assert response sets a cookie with `HttpOnly` flag containing a valid JWT encoding userId and role
    - Generate incorrect credentials; assert 401 response with a generic message that does not reveal which field is wrong
    - **Validates: Requirements 1.6, 2.1, 2.2**

  - [ ]* 3.5 Write property test for password never exposed in API responses (Property 10)
    - **Property 10: Password never exposed in any API response**
    - Call registration, login, profile fetch, user list, and user update endpoints with generated payloads
    - Assert no response body contains a `password` or `passwordHash` field
    - **Validates: Requirements 8.4, 9.1**

- [x] 4. Auth API routes
  - [x] 4.1 Implement register, login, and logout API routes
    - Write `src/app/api/auth/register/route.js`: validate with `registerSchema`, call `authService.createUser`, issue JWT cookie, return 201
    - Write `src/app/api/auth/login/route.js`: validate with `loginSchema`, call `authService.verifyCredentials`, issue JWT cookie, return 200
    - Write `src/app/api/auth/logout/route.js`: call `authService.clearSession`, return 200
    - Return 409 on duplicate email; return 401 with generic message on invalid credentials
    - _Requirements: 1.1, 1.2, 1.3, 1.6, 2.1, 2.2, 2.3_

- [x] 5. RBAC middleware
  - [x] 5.1 Implement RBAC middleware
    - Write `src/middleware/rbac.js` exporting `withAuth(handler, allowedRoles)` that reads the JWT from the HTTP-only cookie, verifies it, checks the user's role against `allowedRoles`, and returns 401 or 403 on failure
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.2 Write property test for RBAC unauthorized access rejection (Property 15)
    - **Property 15: RBAC rejects unauthorized access**
    - Generate requests to protected routes without a JWT; assert 401 response
    - Generate requests with a JWT whose role does not match the required role; assert 403 response
    - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 6. Complaint service and API routes
  - [x] 6.1 Implement complaint service
    - Write `src/services/complaintService.js` implementing `createComplaint`, `getComplaintsByRole`, `updateComplaint`, `deleteComplaint`, and `getAnalytics`
    - `getComplaintsByRole`: students see only their own complaints, staff see only assigned complaints, admins see all
    - `getAnalytics`: use MongoDB aggregation pipeline to compute status breakdown, category breakdown, and open complaint count
    - _Requirements: 4.1, 4.4, 5.1, 6.1, 6.4, 6.5, 6.6, 7.1, 7.2, 7.3, 7.4, 7.5, 10.1, 10.2, 10.4, 10.5_

  - [ ]* 6.2 Write property test for role-based complaint visibility (Property 4)
    - **Property 4: Role-based complaint visibility**
    - Generate complaints for multiple students and staff members
    - Assert students see only complaints where `studentId` matches their ID
    - Assert staff see only complaints where `assignedTo` matches their ID
    - Assert admins see all complaints
    - **Validates: Requirements 5.1, 6.1, 7.1**

  - [ ]* 6.3 Write property test for new complaint creation invariants (Property 5)
    - **Property 5: New complaint creation invariants**
    - Generate valid complaint payloads submitted by a student
    - Assert created complaint has `status === "Pending"`, `studentId` matches the submitting student, and all submitted fields (title, description, category, priority) are unchanged
    - Assert response includes generated ID and timestamps
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 6.4 Write property test for staff status transition constraint (Property 7)
    - **Property 7: Staff status transition constraint**
    - Generate status values outside `["In Progress", "Resolved", "Rejected"]`
    - Assert the complaint service returns a 400 error and the complaint remains unchanged
    - **Validates: Requirements 7.2**

  - [ ]* 6.5 Write property test for resolution note required for resolved status (Property 8)
    - **Property 8: Resolution note required for resolved status**
    - Generate "Resolved" status update requests from a Staff member without a `resolutionNote`
    - Assert the request is rejected and the complaint's status remains unchanged
    - **Validates: Requirements 7.4**

  - [ ]* 6.6 Write property test for staff ownership enforcement (Property 9)
    - **Property 9: Staff ownership enforcement**
    - Generate complaints assigned to one staff member; attempt updates from a different staff member's JWT
    - Assert 403 Forbidden response and complaint remains unchanged
    - **Validates: Requirements 7.5**

  - [ ]* 6.7 Write property test for analytics aggregation consistency (Property 12)
    - **Property 12: Analytics aggregation consistency**
    - Generate complaints with mixed statuses and categories
    - Assert analytics status breakdown counts match manual aggregation per status
    - Assert analytics category breakdown counts match manual aggregation per category
    - Assert open complaints count equals sum of Pending + Under Review + In Progress
    - **Validates: Requirements 10.1, 10.2, 10.5**

  - [ ]* 6.8 Write property test for assign complaint sets Under Review (Property 13)
    - **Property 13: Assign complaint sets Under Review**
    - Generate admin assignment actions targeting various complaints and staff IDs
    - Assert `assignedTo` is set to the assigned staff member's ID and `status` becomes "Under Review"
    - **Validates: Requirements 6.4**

  - [ ]* 6.9 Write property test for complaint deletion permanence (Property 14)
    - **Property 14: Complaint deletion is permanent**
    - Create a complaint, delete it via the admin endpoint, then issue a GET for the same ID
    - Assert the GET returns 404 Not Found
    - **Validates: Requirements 6.6**

  - [x] 6.10 Implement complaint API routes
    - Write `src/app/api/complaints/route.js`: GET (role-filtered list) and POST (student create) wrapped with `withAuth`
    - Write `src/app/api/complaints/[id]/route.js`: GET (single), PUT (admin/staff update), DELETE (admin only) wrapped with `withAuth`
    - Apply `createComplaintSchema` on POST and `updateComplaintSchema` on PUT
    - Return 404 when complaint ID not found; return 403 for ownership violations
    - _Requirements: 4.1, 4.2, 4.4, 5.1, 6.1, 6.2, 6.5, 6.6, 6.7, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 7. User service and API routes
  - [x] 7.1 Implement user service
    - Write `src/services/userService.js` implementing `getUserById`, `getAllUsers`, and `updateUser`
    - `getAllUsers`: exclude password field; return name, email, role, department, timestamps
    - `updateUser`: prevent students from updating their own role field; allow admins to update role and department
    - Return 404 when user ID not found
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.4_

  - [ ]* 7.2 Write property test for student role immutability (Property 11)
    - **Property 11: Student cannot escalate own role**
    - Generate profile update payloads from a Student that include a `role` field with any value
    - Assert the user's role remains unchanged after the update
    - **Validates: Requirements 9.4**

  - [x] 7.3 Implement user API routes
    - Write `src/app/api/users/route.js`: GET all users (admin only) wrapped with `withAuth`
    - Write `src/app/api/users/[id]/route.js`: GET profile and PUT update wrapped with `withAuth`
    - Apply `updateProfileSchema` for student self-updates and `adminUpdateUserSchema` for admin updates
    - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 9.3_

- [x] 8. Checkpoint — API layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Auth context, custom hooks, and Axios client
  - [x] 9.1 Implement shared utilities and Axios client
    - Write `src/lib/utils.js` with shared helper functions (class name merging, date formatting, etc.)
    - Configure an Axios instance in `src/lib/axios.js` with base URL from `NEXT_PUBLIC_APP_URL` and a 401 interceptor that redirects to `/login`
    - _Requirements: 2.4, 3.7_

  - [x] 9.2 Implement AuthContext and useAuth hook
    - Write `src/context/AuthContext.jsx` providing `user`, `login`, `logout`, and `loading` state via React Context
    - Write `src/hooks/useAuth.js` consuming `AuthContext`
    - On mount, fetch the current user from the profile endpoint to rehydrate session state
    - _Requirements: 2.4_

  - [x] 9.3 Implement useComplaints and useUsers hooks
    - Write `src/hooks/useComplaints.js` with functions for fetching, creating, updating, and deleting complaints via Axios
    - Write `src/hooks/useUsers.js` with functions for fetching all users and updating a user profile via Axios
    - _Requirements: 5.1, 6.1, 7.1, 8.1, 9.2_

- [x] 10. UI primitive components
  - [x] 10.1 Implement primitive UI components
    - Write `src/components/ui/Button.jsx` with variant props (primary, secondary, danger, ghost) and loading state
    - Write `src/components/ui/Input.jsx` with label, error message, and icon slot support
    - Write `src/components/ui/Badge.jsx` with color variant props
    - Write `src/components/ui/Card.jsx` as a styled container component
    - Write `src/components/ui/Modal.jsx` with open/close state, backdrop, and Framer Motion entrance animation
    - Write `src/components/ui/Spinner.jsx` as an animated loading indicator
    - _Requirements: 13.3, 13.4, 13.6_

- [x] 11. Layout and shared components
  - [x] 11.1 Implement layout components
    - Write `src/components/layout/Sidebar.jsx` with role-aware navigation links and collapsible behavior on desktop
    - Write `src/components/layout/Navbar.jsx` with user info display and logout action
    - Write `src/components/layout/MobileNav.jsx` with hamburger menu or bottom navigation for mobile
    - Write `src/components/layout/DashboardLayout.jsx` composing Sidebar, Navbar, and MobileNav with responsive layout
    - _Requirements: 13.1, 13.2_

  - [x] 11.2 Implement shared display components
    - Write `src/components/shared/StatusBadge.jsx` mapping status values to colored Badge variants
    - Write `src/components/shared/PriorityBadge.jsx` mapping priority values to colored Badge variants
    - Write `src/components/shared/EmptyState.jsx` for empty list states with icon and message
    - _Requirements: 5.2, 13.6_

- [x] 12. Dashboard widgets and form components
  - [x] 12.1 Implement dashboard widget components
    - Write `src/components/dashboard/StatsCard.jsx` displaying a metric label, value, and Lucide icon
    - Write `src/components/dashboard/ComplaintTable.jsx` with sortable columns, StatusBadge, PriorityBadge, and action buttons
    - Write `src/components/dashboard/ComplaintCard.jsx` as a mobile-friendly card view of a single complaint
    - Write `src/components/dashboard/AnalyticsChart.jsx` using Recharts to render complaint volume over time (bar or line chart)
    - _Requirements: 10.3, 13.3_

  - [x] 12.2 Implement form components
    - Write `src/components/forms/LoginForm.jsx` using React Hook Form + Zod resolver with email and password fields and error display
    - Write `src/components/forms/RegisterForm.jsx` using React Hook Form + Zod resolver with name, email, password, role, and department fields
    - Write `src/components/forms/ComplaintForm.jsx` using React Hook Form + Zod resolver with title, description, category, priority, and optional attachment fields
    - Display field-level validation errors inline; show toast notifications on submission success or failure
    - _Requirements: 1.3, 4.2, 9.3, 11.1, 13.5_

- [x] 13. Next.js middleware for page-level auth redirects
  - Write `src/middleware.js` (Next.js edge middleware) that reads the JWT cookie on every request to protected paths and redirects unauthenticated users to `/login`
  - Redirect authenticated users away from `/login` and `/register` to their role-specific dashboard
  - _Requirements: 3.4, 3.5, 3.6, 3.7_

- [x] 14. Public pages
  - [x] 14.1 Implement public pages
    - Write `src/app/page.jsx` as the Landing page with hero section, feature highlights, and navigation links to Login/Register; show dashboard link for authenticated users
    - Write `src/app/about/page.jsx` as the About page
    - Write `src/app/contact/page.jsx` as the Contact page
    - Apply Framer Motion page transition animations
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 13.4_

- [x] 15. Auth pages
  - [x] 15.1 Implement login and register pages
    - Write `src/app/(auth)/login/page.jsx` rendering `LoginForm` and handling redirect to role-specific dashboard on success
    - Write `src/app/(auth)/register/page.jsx` rendering `RegisterForm` and handling redirect to student dashboard on success
    - _Requirements: 1.1, 2.1, 14.5_

- [x] 16. Student dashboard pages
  - [x] 16.1 Implement student dashboard home
    - Write `src/app/dashboard/student/page.jsx` displaying summary stats (total complaints, open complaints, resolved complaints) using `StatsCard` and a recent complaints list using `ComplaintCard`
    - _Requirements: 5.2, 5.3_

  - [x] 16.2 Implement complaint history and detail pages
    - Write `src/app/dashboard/student/complaints/page.jsx` displaying the full complaint list with search by title/category using `ComplaintTable` or `ComplaintCard` and `useComplaints`
    - Write `src/app/dashboard/student/complaints/[id]/page.jsx` displaying full complaint details including description, status, resolution note, and attachments
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 16.3 Implement create complaint page
    - Write `src/app/dashboard/student/complaints/new/page.jsx` rendering `ComplaintForm` and calling the POST `/api/complaints` endpoint on submission
    - Show success toast and redirect to complaint history on success
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [x] 16.4 Implement student profile page
    - Write `src/app/dashboard/student/profile/page.jsx` displaying current profile data and rendering an edit form using `updateProfileSchema`
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 17. Admin dashboard pages
  - [x] 17.1 Implement admin dashboard with analytics
    - Write `src/app/dashboard/admin/page.jsx` displaying `StatsCard` components for total, open, resolved, and rejected complaint counts and rendering `AnalyticsChart` with trend data
    - Fetch analytics from `GET /api/complaints/analytics` (or equivalent aggregation endpoint)
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 17.2 Implement admin complaint management page
    - Write `src/app/dashboard/admin/complaints/page.jsx` with `ComplaintTable` showing all complaints, filter controls for Status/Category/Priority, search by title or student name, assign-to-staff modal, and delete confirmation modal
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

  - [x] 17.3 Implement admin user management page
    - Write `src/app/dashboard/admin/users/page.jsx` displaying all users in a table with role and department edit capability using `adminUpdateUserSchema`
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 18. Staff dashboard pages
  - [x] 18.1 Implement staff dashboard home
    - Write `src/app/dashboard/staff/page.jsx` displaying summary stats for assigned complaints (total, in progress, resolved) using `StatsCard`
    - _Requirements: 7.1_

  - [x] 18.2 Implement staff assigned complaints page
    - Write `src/app/dashboard/staff/complaints/page.jsx` displaying only complaints assigned to the authenticated staff member using `ComplaintTable`
    - Include inline status update controls (restricted to "In Progress", "Resolved", "Rejected") and a resolution note input that is required when selecting "Resolved"
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 19. Root layout and global configuration
  - Write `src/app/layout.jsx` as the root layout wrapping the app with `AuthContext.Provider`, toast provider (React Hot Toast or Sonner), and global CSS imports
  - Ensure Framer Motion `AnimatePresence` wraps page transitions at the layout level
  - _Requirements: 13.4, 13.5_

- [x] 20. Checkpoint — Full application wired together
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with a minimum of 100 iterations (`numRuns: 100`)
- Property test tag format: `Feature: student-complaint-system, Property {N}: {property_text}`
- Checkpoints at tasks 8 and 20 ensure incremental validation before moving to the next layer
- The `password` field on the User model uses `select: false` to prevent accidental exposure in any query
- All secrets are read exclusively from environment variables — never hardcoded
