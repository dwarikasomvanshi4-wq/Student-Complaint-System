# Requirements Document

## Introduction

The Student Complaint System is a production-ready, full-stack web application that enables students of an educational institution to register, submit, and track complaints across multiple service categories (academics, hostel, transport, infrastructure, library, examination, cafeteria, and others). The system supports three user roles — Student, Admin, and Staff — each with distinct capabilities. Admins manage the full complaint lifecycle, assign complaints to staff members, and access analytics. Staff members handle assigned complaints and record resolution notes. The platform is built with Next.js (App Router), MongoDB, JWT authentication, and a modern SaaS-style UI.

---

## Glossary

- **System**: The Student Complaint System web application.
- **Student**: An authenticated user with the "student" role who submits and tracks complaints.
- **Admin**: An authenticated user with the "admin" role who manages all complaints, users, and analytics.
- **Staff**: An authenticated user with the "staff" role who handles complaints assigned to them.
- **Complaint**: A formal submission by a Student describing an issue in one of the defined categories.
- **Category**: One of the predefined complaint types: Academics, Hostel, Infrastructure, Transport, Library, Examination, Cafeteria, Others.
- **Status**: The current lifecycle state of a Complaint: Pending, Under Review, In Progress, Resolved, or Rejected.
- **Priority**: The urgency level of a Complaint: Low, Medium, or High.
- **JWT**: JSON Web Token used for stateless authentication.
- **Auth_Service**: The module responsible for registration, login, logout, and JWT verification.
- **Complaint_Service**: The module responsible for creating, reading, updating, and deleting complaints.
- **User_Service**: The module responsible for reading and updating user profiles.
- **Validator**: The module responsible for validating all incoming request payloads using Zod schemas.
- **RBAC_Middleware**: The middleware that enforces role-based access control on protected API routes.
- **Dashboard**: The role-specific landing page shown after a successful login.
- **Resolution_Note**: A text note added by Staff or Admin describing how a complaint was resolved.
- **Attachment**: An optional file uploaded by a Student alongside a complaint submission.

---

## Requirements

### Requirement 1: User Registration

**User Story:** As a new user, I want to register an account with my name, email, password, role, and department, so that I can access the system with appropriate permissions.

#### Acceptance Criteria

1. WHEN a registration request is received with valid name, email, password, role, and department fields, THE Auth_Service SHALL create a new user record with the password hashed using bcryptjs and return a success response.
2. WHEN a registration request is received with an email that already exists in the database, THE Auth_Service SHALL return a 409 Conflict error with a descriptive message.
3. WHEN a registration request is received with missing or malformed fields, THE Validator SHALL return a 400 Bad Request error listing each invalid field.
4. THE Auth_Service SHALL hash passwords using bcryptjs with a minimum salt round of 10 before persisting to the database.
5. THE Auth_Service SHALL assign the "student" role by default when no role is specified in the registration payload.
6. WHEN a user is successfully registered, THE Auth_Service SHALL issue a JWT token and set it as an HTTP-only cookie in the response.

---

### Requirement 2: User Login and Logout

**User Story:** As a registered user, I want to log in with my email and password and remain logged in across page refreshes, so that I can access my role-specific features without re-authenticating.

#### Acceptance Criteria

1. WHEN a login request is received with a valid email and correct password, THE Auth_Service SHALL verify the password against the stored bcryptjs hash and return a signed JWT token set as an HTTP-only cookie.
2. WHEN a login request is received with an unregistered email or incorrect password, THE Auth_Service SHALL return a 401 Unauthorized error with a generic message that does not reveal which field is incorrect.
3. WHEN a logout request is received, THE Auth_Service SHALL clear the JWT cookie and return a 200 success response.
4. THE System SHALL persist the authenticated session using an HTTP-only cookie so that the login state survives page refreshes without requiring re-authentication.
5. WHEN a JWT token has expired, THE Auth_Service SHALL return a 401 Unauthorized error and clear the cookie.

---

### Requirement 3: Role-Based Access Control

**User Story:** As a system operator, I want each user role to access only its permitted pages and API routes, so that data integrity and security are maintained.

#### Acceptance Criteria

1. WHILE a request targets a protected API route, THE RBAC_Middleware SHALL verify the JWT token from the HTTP-only cookie before allowing the request to proceed.
2. IF a request to a protected API route contains no JWT token or an invalid JWT token, THEN THE RBAC_Middleware SHALL return a 401 Unauthorized error.
3. IF a request to a role-restricted API route is made by a user whose role does not match the required role, THEN THE RBAC_Middleware SHALL return a 403 Forbidden error.
4. THE System SHALL restrict the Admin Dashboard, Complaint Management, User Management, and Analytics pages to users with the "admin" role.
5. THE System SHALL restrict the Staff Dashboard and Assigned Complaints page to users with the "staff" role.
6. THE System SHALL restrict the Student Dashboard, Create Complaint, Complaint History, and Profile pages to users with the "student" role.
7. WHEN an unauthenticated user attempts to access a protected page, THE System SHALL redirect the user to the Login page.

---

### Requirement 4: Student Complaint Submission

**User Story:** As a student, I want to submit a complaint with a title, description, category, and optional attachments, so that the institution can address my concern.

#### Acceptance Criteria

1. WHEN a Student submits a complaint with a valid title, description, and category, THE Complaint_Service SHALL create a new Complaint record with status set to "Pending" and associate it with the authenticated Student's user ID.
2. WHEN a complaint submission request contains missing or invalid fields, THE Validator SHALL return a 400 Bad Request error listing each invalid field.
3. THE Complaint_Service SHALL accept an optional attachment field containing a file reference and store it in the Complaint record.
4. WHEN a complaint is successfully created, THE Complaint_Service SHALL return the created Complaint object including its generated ID, status, and timestamps.
5. THE System SHALL allow a Student to select exactly one Category from the predefined list: Academics, Hostel, Infrastructure, Transport, Library, Examination, Cafeteria, Others.
6. THE System SHALL allow a Student to set a Priority of Low, Medium, or High when submitting a complaint.

---

### Requirement 5: Student Complaint Tracking and History

**User Story:** As a student, I want to view all my submitted complaints and their current statuses, so that I can track the progress of my concerns.

#### Acceptance Criteria

1. WHEN a Student requests their complaint list, THE Complaint_Service SHALL return only the complaints whose studentId matches the authenticated Student's user ID.
2. THE System SHALL display each complaint's title, category, status, priority, and submission date in the complaint history view.
3. WHEN a Student selects a specific complaint, THE System SHALL display the full complaint details including description, status history, Resolution_Note (if any), and attachments.
4. THE System SHALL allow a Student to search their complaints by title or category using a text input field.
5. WHEN a complaint's status is updated by Admin or Staff, THE System SHALL reflect the updated status in the Student's complaint history view upon the next data fetch.

---

### Requirement 6: Admin Complaint Management

**User Story:** As an admin, I want to view, filter, assign, update, and delete all complaints in the system, so that I can ensure every complaint is handled appropriately.

#### Acceptance Criteria

1. WHEN an Admin requests the complaint list, THE Complaint_Service SHALL return all complaints in the system regardless of studentId.
2. THE System SHALL allow an Admin to filter complaints by Status, Category, and Priority.
3. THE System SHALL allow an Admin to search complaints by title or student name using a text input field.
4. WHEN an Admin assigns a complaint to a Staff member, THE Complaint_Service SHALL update the complaint's assignedTo field with the selected Staff user's ID and set the status to "Under Review".
5. WHEN an Admin updates a complaint's status, THE Complaint_Service SHALL persist the new status and return the updated Complaint object.
6. WHEN an Admin deletes a complaint, THE Complaint_Service SHALL permanently remove the Complaint record from the database and return a 200 success response.
7. IF a delete request targets a complaint ID that does not exist, THEN THE Complaint_Service SHALL return a 404 Not Found error.

---

### Requirement 7: Staff Complaint Handling

**User Story:** As a staff member, I want to view complaints assigned to me, update their progress, add resolution notes, and mark them resolved, so that I can efficiently address student concerns.

#### Acceptance Criteria

1. WHEN a Staff member requests their complaint list, THE Complaint_Service SHALL return only the complaints whose assignedTo field matches the authenticated Staff member's user ID.
2. WHEN a Staff member updates a complaint's status, THE Complaint_Service SHALL accept only the values "In Progress", "Resolved", or "Rejected" and persist the change.
3. WHEN a Staff member adds a Resolution_Note to a complaint, THE Complaint_Service SHALL store the note text in the complaint's resolutionNote field and return the updated Complaint object.
4. WHEN a Staff member marks a complaint as "Resolved", THE Complaint_Service SHALL require a non-empty Resolution_Note to be present before persisting the status change.
5. IF a Staff member attempts to update a complaint not assigned to them, THEN THE RBAC_Middleware SHALL return a 403 Forbidden error.

---

### Requirement 8: Admin User Management

**User Story:** As an admin, I want to view and update all registered users, so that I can manage the user base of the system.

#### Acceptance Criteria

1. WHEN an Admin requests the user list, THE User_Service SHALL return all registered users with their name, email, role, department, and registration date, excluding password fields.
2. WHEN an Admin updates a user's role or department, THE User_Service SHALL persist the changes and return the updated user object.
3. IF an update request targets a user ID that does not exist, THEN THE User_Service SHALL return a 404 Not Found error.
4. THE User_Service SHALL never return or expose password hashes in any API response.

---

### Requirement 9: Student Profile Management

**User Story:** As a student, I want to view and edit my profile information, so that my account details remain accurate.

#### Acceptance Criteria

1. WHEN a Student requests their profile, THE User_Service SHALL return the authenticated user's name, email, role, department, and profileImage, excluding the password field.
2. WHEN a Student submits a profile update with valid name, department, or profileImage fields, THE User_Service SHALL persist the changes and return the updated user object.
3. WHEN a profile update request contains invalid field values, THE Validator SHALL return a 400 Bad Request error listing each invalid field.
4. THE User_Service SHALL prevent a Student from updating their own role field.

---

### Requirement 10: Admin Analytics Dashboard

**User Story:** As an admin, I want to view complaint analytics including counts by status, category, and trends over time, so that I can make data-driven decisions about institutional services.

#### Acceptance Criteria

1. THE System SHALL display the total count of complaints grouped by Status on the Admin Dashboard.
2. THE System SHALL display the total count of complaints grouped by Category on the Admin Dashboard.
3. THE System SHALL render complaint trend data as a chart using Recharts, showing complaint volume over time (by month or week).
4. WHEN the Admin Dashboard loads, THE System SHALL fetch analytics data from the complaints collection and compute aggregations server-side.
5. THE System SHALL display the count of currently open complaints (status is Pending, Under Review, or In Progress) as a summary metric on the Admin Dashboard.

---

### Requirement 11: Input Validation

**User Story:** As a system operator, I want all API inputs to be validated against defined schemas, so that malformed or malicious data does not reach the database.

#### Acceptance Criteria

1. THE Validator SHALL validate all incoming API request bodies against Zod schemas before the request handler executes.
2. WHEN a request body fails Zod schema validation, THE Validator SHALL return a 400 Bad Request response with a structured error object listing each field and its validation failure reason.
3. THE Validator SHALL enforce a maximum length of 100 characters for complaint title fields.
4. THE Validator SHALL enforce a maximum length of 2000 characters for complaint description fields.
5. THE Validator SHALL enforce that email fields conform to a valid email address format.
6. THE Validator SHALL enforce that password fields have a minimum length of 8 characters.

---

### Requirement 12: Database Connectivity and Security

**User Story:** As a developer, I want the application to connect securely to MongoDB Atlas and protect against injection attacks, so that data is stored reliably and safely.

#### Acceptance Criteria

1. THE System SHALL establish a MongoDB connection using the MONGODB_URI environment variable via Mongoose ODM.
2. WHEN the MongoDB connection fails on startup, THE System SHALL log the error and terminate the process with a non-zero exit code.
3. THE System SHALL use Mongoose schema definitions with strict mode enabled to prevent injection of undefined fields into the database.
4. THE System SHALL read all secrets (MONGODB_URI, JWT_SECRET, NEXT_PUBLIC_APP_URL) exclusively from environment variables and never hardcode them in source files.
5. WHEN a Mongoose query encounters an error, THE System SHALL return a 500 Internal Server Error response with a generic message and log the detailed error server-side.

---

### Requirement 13: Responsive UI and Navigation

**User Story:** As a user on any device, I want the application to be fully usable on mobile, tablet, and desktop screens, so that I can access the system from any device.

#### Acceptance Criteria

1. THE System SHALL render all pages using a responsive layout that adapts to screen widths of 320px (mobile), 768px (tablet), and 1280px (desktop) without horizontal scrolling.
2. THE System SHALL display a collapsible sidebar navigation for authenticated users on desktop and a bottom navigation or hamburger menu on mobile.
3. THE System SHALL apply the defined color theme: primary Indigo/Blue, secondary Slate, accent Emerald, and error Red using Tailwind CSS utility classes.
4. THE System SHALL use Framer Motion to apply smooth page transition animations and micro-interaction animations on interactive elements.
5. THE System SHALL display toast notifications using React Hot Toast or Sonner for success, error, and informational feedback on user actions.
6. THE System SHALL use Lucide React icons consistently across all navigation, action buttons, and status indicators.

---

### Requirement 14: Public Pages

**User Story:** As a visitor, I want to access a landing page, about page, and contact page without logging in, so that I can learn about the system before registering.

#### Acceptance Criteria

1. THE System SHALL serve a public Landing page at the root path ("/") that is accessible without authentication.
2. THE System SHALL serve a public About page at "/about" that is accessible without authentication.
3. THE System SHALL serve a public Contact page at "/contact" that is accessible without authentication.
4. WHEN an authenticated user visits the Landing page, THE System SHALL display navigation links to the user's role-specific Dashboard.
5. THE System SHALL serve the Login page at "/login" and the Register page at "/register" without requiring authentication.
