# Design Document

## Student Complaint System

---

## Overview

The Student Complaint System is a production-ready full-stack web application built on Next.js 14+ (App Router) with MongoDB as the persistence layer. It enables students to submit and track complaints, staff to handle assigned complaints, and admins to manage the full complaint lifecycle with analytics.

The system follows a three-tier architecture: a Next.js frontend with server and client components, Next.js API Routes as the backend layer, and MongoDB Atlas as the database. Authentication is stateless via JWT stored in HTTP-only cookies. Role-based access control (RBAC) is enforced at both the API middleware layer and the UI routing layer.

### Key Design Decisions

- **Next.js App Router** — Enables server components for data fetching, layouts for shared navigation, and route groups for role-based page organization.
- **JWT in HTTP-only cookies** — Prevents XSS token theft while supporting server-side session verification in API routes and middleware.
- **Mongoose with strict mode** — Prevents injection of undefined fields and provides schema-level validation as a second line of defense after Zod.
- **Zod validation at API boundary** — All incoming request bodies are validated before reaching business logic, ensuring malformed data never reaches the database.
- **Server-side aggregation for analytics** — MongoDB aggregation pipelines compute complaint statistics server-side, keeping the client thin.

---

## Architecture

```mermaid
graph TB
    subgraph Client["Browser (Client)"]
        UI[React Components]
        CTX[Auth Context]
        HOOKS[Custom Hooks]
    end

    subgraph NextJS["Next.js App (Vercel)"]
        MW[Next.js Middleware\nJWT Verification + Redirect]
        PAGES[App Router Pages\n/app/(auth), /dashboard/*]
        API[API Routes\n/api/auth, /api/complaints, /api/users]
        RBAC[RBAC Middleware\nRole Enforcement]
        SVC[Service Layer\nAuth / Complaint / User]
        VAL[Zod Validators]
    end

    subgraph DB["MongoDB Atlas"]
        USERS[(users collection)]
        COMPLAINTS[(complaints collection)]
    end

    UI --> PAGES
    UI --> API
    CTX --> UI
    HOOKS --> API
    MW --> PAGES
    API --> RBAC
    RBAC --> SVC
    SVC --> VAL
    SVC --> USERS
    SVC --> COMPLAINTS
```

### Request Flow

1. Browser sends request → Next.js Middleware checks JWT cookie → redirects unauthenticated users to `/login`
2. Authenticated page loads → client components call API routes via Axios
3. API route → RBAC Middleware verifies JWT and role → Service layer executes business logic → Mongoose queries MongoDB
4. Response flows back through service → API route → client

---

## Components and Interfaces

### Directory Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.jsx
│   │   └── register/page.jsx
│   ├── dashboard/
│   │   ├── student/
│   │   │   ├── page.jsx              # Student dashboard home
│   │   │   ├── complaints/page.jsx   # Complaint history
│   │   │   ├── complaints/new/page.jsx
│   │   │   └── profile/page.jsx
│   │   ├── admin/
│   │   │   ├── page.jsx              # Admin dashboard + analytics
│   │   │   ├── complaints/page.jsx
│   │   │   └── users/page.jsx
│   │   └── staff/
│   │       ├── page.jsx              # Staff dashboard
│   │       └── complaints/page.jsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.js
│   │   │   ├── login/route.js
│   │   │   └── logout/route.js
│   │   ├── complaints/
│   │   │   ├── route.js              # GET all, POST create
│   │   │   └── [id]/route.js         # GET one, PUT update, DELETE
│   │   └── users/
│   │       ├── route.js              # GET all users (admin)
│   │       └── [id]/route.js         # GET one, PUT update
│   ├── about/page.jsx
│   ├── contact/page.jsx
│   ├── page.jsx                      # Landing page
│   └── layout.jsx
├── components/
│   ├── ui/                           # Primitive UI components
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   └── Spinner.jsx
│   ├── dashboard/                    # Dashboard-specific widgets
│   │   ├── StatsCard.jsx
│   │   ├── ComplaintTable.jsx
│   │   ├── ComplaintCard.jsx
│   │   └── AnalyticsChart.jsx
│   ├── forms/
│   │   ├── ComplaintForm.jsx
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── layout/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── MobileNav.jsx
│   │   └── DashboardLayout.jsx
│   └── shared/
│       ├── StatusBadge.jsx
│       ├── PriorityBadge.jsx
│       └── EmptyState.jsx
├── lib/
│   ├── db.js                         # Mongoose connection singleton
│   ├── jwt.js                        # JWT sign/verify helpers
│   └── utils.js                      # Shared utilities
├── models/
│   ├── User.js
│   └── Complaint.js
├── middleware/
│   └── rbac.js                       # Role-based access control
├── hooks/
│   ├── useAuth.js
│   ├── useComplaints.js
│   └── useUsers.js
├── context/
│   └── AuthContext.jsx
├── services/
│   ├── authService.js
│   ├── complaintService.js
│   └── userService.js
├── validations/
│   ├── authSchemas.js
│   ├── complaintSchemas.js
│   └── userSchemas.js
└── constants/
    ├── roles.js
    ├── categories.js
    └── statuses.js
```

### API Interface Summary

| Method | Route | Role | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, set JWT cookie |
| POST | `/api/auth/logout` | Auth | Clear JWT cookie |
| GET | `/api/complaints` | Auth | Get complaints (filtered by role) |
| POST | `/api/complaints` | Student | Create complaint |
| GET | `/api/complaints/[id]` | Auth | Get single complaint |
| PUT | `/api/complaints/[id]` | Admin/Staff | Update complaint |
| DELETE | `/api/complaints/[id]` | Admin | Delete complaint |
| GET | `/api/users` | Admin | Get all users |
| GET | `/api/users/[id]` | Auth | Get user profile |
| PUT | `/api/users/[id]` | Auth | Update user profile |

### RBAC Middleware Interface

```javascript
// src/middleware/rbac.js
/**
 * Verifies JWT from HTTP-only cookie and checks role authorization.
 * @param {Request} req - Next.js API request
 * @param {string[]} allowedRoles - Roles permitted to access the route
 * @returns {{ user: DecodedJWT } | NextResponse} - Decoded user or error response
 */
export function withAuth(handler, allowedRoles = [])
```

### Service Layer Interfaces

```javascript
// Auth Service
createUser(name, email, password, role, department) → Promise<User>
verifyCredentials(email, password) → Promise<User>
issueToken(userId, role) → string
clearSession(response) → void

// Complaint Service
createComplaint(studentId, payload) → Promise<Complaint>
getComplaintsByRole(userId, role, filters) → Promise<Complaint[]>
updateComplaint(complaintId, userId, role, updates) → Promise<Complaint>
deleteComplaint(complaintId) → Promise<void>
getAnalytics() → Promise<AnalyticsData>

// User Service
getUserById(userId) → Promise<User>
getAllUsers() → Promise<User[]>
updateUser(userId, requesterId, requesterRole, updates) → Promise<User>
```

---

## Data Models

### User Model (`src/models/User.js`)

```javascript
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,   // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'staff'],
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    profileImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, strict: true }
);
```

**Indexes:** `email` (unique)

### Complaint Model (`src/models/Complaint.js`)

```javascript
const ComplaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: ['Academics', 'Hostel', 'Infrastructure', 'Transport',
             'Library', 'Examination', 'Cafeteria', 'Others'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNote: {
      type: String,
      default: null,
      maxlength: 2000,
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true, strict: true }
);
```

**Indexes:** `studentId`, `assignedTo`, `status`, `category`

### Zod Validation Schemas

```javascript
// src/validations/authSchemas.js
export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['student', 'admin', 'staff']).optional().default('student'),
  department: z.string().min(1).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// src/validations/complaintSchemas.js
export const createComplaintSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  category: z.enum(['Academics', 'Hostel', 'Infrastructure', 'Transport',
                    'Library', 'Examination', 'Cafeteria', 'Others']),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  attachments: z.array(z.object({ filename: z.string(), url: z.string() })).optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected']).optional(),
  assignedTo: z.string().optional(),
  resolutionNote: z.string().max(2000).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
});

// src/validations/userSchemas.js
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  profileImage: z.string().url().optional(),
});

export const adminUpdateUserSchema = z.object({
  role: z.enum(['student', 'admin', 'staff']).optional(),
  department: z.string().min(1).max(100).optional(),
});
```

### Constants

```javascript
// src/constants/roles.js
export const ROLES = { STUDENT: 'student', ADMIN: 'admin', STAFF: 'staff' };

// src/constants/categories.js
export const CATEGORIES = ['Academics', 'Hostel', 'Infrastructure', 'Transport',
                           'Library', 'Examination', 'Cafeteria', 'Others'];

// src/constants/statuses.js
export const STATUSES = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
};
export const OPEN_STATUSES = ['Pending', 'Under Review', 'In Progress'];
export const STAFF_ALLOWED_STATUSES = ['In Progress', 'Resolved', 'Rejected'];
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Password hashing round-trip

*For any* plaintext password string of 8 or more characters, hashing it with bcryptjs SHALL produce a value that (a) does not equal the original plaintext and (b) passes `bcrypt.compare(plaintext, hash)` as true. The stored user record SHALL contain the hash, never the plaintext.

**Validates: Requirements 1.1, 1.4**

---

### Property 2: Default role assignment

*For any* registration payload that omits the role field, the created user record SHALL have the role field set to "student".

**Validates: Requirements 1.5**

---

### Property 3: Successful auth responses always set HTTP-only JWT cookie

*For any* successful registration or login request, the response SHALL set a cookie that is marked HTTP-only and contains a valid JWT encoding the user's ID and role. Submitting incorrect credentials during login SHALL produce a 401 response that does not reveal which field is wrong.

**Validates: Requirements 1.6, 2.1, 2.2**

---

### Property 4: Role-based complaint visibility

*For any* authenticated user, the complaints returned by `GET /api/complaints` SHALL be exactly the set of complaints the user's role is permitted to see — students see only complaints where `studentId` matches their ID, staff see only complaints where `assignedTo` matches their ID, and admins see all complaints.

**Validates: Requirements 5.1, 6.1, 7.1**

---

### Property 5: New complaint creation invariants

*For any* valid complaint submission by a student, the created complaint SHALL have status "Pending", SHALL reference the submitting student's ID in the `studentId` field, and SHALL contain the submitted title, description, category, and priority values unchanged. The response SHALL include the generated ID and timestamps.

**Validates: Requirements 4.1, 4.4**

---

### Property 6: Zod validation rejects malformed payloads with field-level errors

*For any* API request body that fails Zod schema validation — including titles exceeding 100 characters, descriptions exceeding 2000 characters, invalid email formats, passwords shorter than 8 characters, or missing required fields — the response SHALL be a 400 Bad Request containing a structured error object that lists each failing field and its reason, and no database write SHALL occur.

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5, 11.6**

---

### Property 7: Staff status transition constraint

*For any* status update request from a Staff member, the Complaint_Service SHALL accept only the values "In Progress", "Resolved", or "Rejected" and SHALL reject any other status value with a 400 error, leaving the complaint unchanged.

**Validates: Requirements 7.2**

---

### Property 8: Resolution note required for resolved status

*For any* attempt by a Staff member to set a complaint's status to "Resolved" without a non-empty `resolutionNote`, the Complaint_Service SHALL reject the request and the complaint's status SHALL remain unchanged.

**Validates: Requirements 7.4**

---

### Property 9: Staff ownership enforcement

*For any* Staff member attempting to update a complaint whose `assignedTo` field does not match their user ID, the RBAC_Middleware SHALL return a 403 Forbidden response and the complaint SHALL remain unchanged.

**Validates: Requirements 7.5**

---

### Property 10: Password never exposed in any API response

*For any* API response from Auth_Service or User_Service — including registration, login, profile fetch, user list, and user update endpoints — the response body SHALL NOT contain a `password` or `passwordHash` field.

**Validates: Requirements 8.4, 9.1**

---

### Property 11: Student cannot escalate own role

*For any* profile update request from a Student that includes a `role` field, the User_Service SHALL ignore the role field and the user's role SHALL remain unchanged after the update.

**Validates: Requirements 9.4**

---

### Property 12: Analytics aggregation consistency

*For any* state of the complaints collection, the analytics endpoint SHALL return: (a) a status breakdown where the count for each status equals the actual count of complaints with that status, (b) a category breakdown where the count for each category equals the actual count of complaints in that category, and (c) an "open complaints" count equal to the sum of complaints with status "Pending", "Under Review", or "In Progress".

**Validates: Requirements 10.1, 10.2, 10.5**

---

### Property 13: Assign complaint sets Under Review

*For any* admin action that assigns a complaint to a staff member, the complaint's `assignedTo` field SHALL be set to the assigned staff member's ID and the status SHALL be set to "Under Review".

**Validates: Requirements 6.4**

---

### Property 14: Complaint deletion is permanent

*For any* complaint that is successfully deleted by an admin, a subsequent GET request for that complaint's ID SHALL return a 404 Not Found response.

**Validates: Requirements 6.6**

---

### Property 15: RBAC rejects unauthorized access

*For any* request to a protected API route without a valid JWT, the RBAC_Middleware SHALL return 401. For any request from a user whose role does not match the required role for that route, the RBAC_Middleware SHALL return 403.

**Validates: Requirements 3.1, 3.2, 3.3**

---

## Error Handling

### HTTP Error Response Format

All API errors return a consistent JSON envelope:

```json
{
  "success": false,
  "message": "Human-readable description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

The `errors` array is only present for 400 validation errors.

### Error Mapping

| Scenario | HTTP Status | Message Strategy |
|----------|-------------|-----------------|
| Zod validation failure | 400 | List each field + reason |
| Duplicate email on register | 409 | "Email already registered" |
| Invalid credentials | 401 | Generic — does not reveal which field |
| Missing/invalid JWT | 401 | "Authentication required" |
| Insufficient role | 403 | "Access denied" |
| Resource not found | 404 | "Resource not found" |
| MongoDB query error | 500 | Generic message; detailed error logged server-side |
| MongoDB connection failure | Process exit | Error logged; process exits with code 1 |

### Error Handling Layers

1. **Zod Middleware** — Validates request body before handler runs; returns 400 with field-level errors.
2. **RBAC Middleware** — Verifies JWT and role; returns 401 or 403.
3. **Service Layer** — Catches Mongoose errors; throws typed application errors.
4. **API Route Handler** — Catches all thrown errors; maps to HTTP responses; logs server-side details.
5. **Next.js Middleware** — Redirects unauthenticated page requests to `/login`.

### Client-Side Error Handling

- Axios interceptors catch 401 responses and redirect to `/login`.
- React Hook Form + Zod provide client-side validation before submission.
- React Hot Toast / Sonner displays success and error toasts on all mutations.

---

## Testing Strategy

### Dual Testing Approach

The system uses both unit/example-based tests and property-based tests for comprehensive coverage.

### Unit and Integration Tests

**Framework:** Jest + React Testing Library (for components), Jest + Supertest (for API routes)

Focus areas:
- Auth service: registration, login, logout flows with concrete examples
- RBAC middleware: valid token, expired token, wrong role scenarios
- Complaint service: CRUD operations with example payloads
- User service: profile read/update, admin user management
- Zod validators: valid and invalid payloads for each schema
- UI components: rendering, form submission, error display

### Property-Based Tests

**Framework:** [fast-check](https://github.com/dubzzz/fast-check) (JavaScript PBT library)

Each property test runs a minimum of **100 iterations** with randomly generated inputs.

Tag format: `Feature: student-complaint-system, Property {N}: {property_text}`

| Property | Test Strategy |
|----------|--------------|
| P1: Password hashing round-trip | Generate random password strings ≥8 chars; hash with bcryptjs; assert `hash !== original` and `bcrypt.compare(original, hash) === true`; assert stored user has hash not plaintext |
| P2: Default role assignment | Generate registration payloads without role field; assert created user has role "student" |
| P3: Auth responses set HTTP-only JWT cookie | Generate valid registration and login payloads; assert response Set-Cookie header has HttpOnly flag and valid JWT; generate incorrect credentials; assert 401 with generic message |
| P4: Role-based complaint visibility | Generate complaints for multiple students/staff; assert each role sees only their permitted subset |
| P5: New complaint creation invariants | Generate valid complaint payloads; assert created complaint has status "Pending", correct studentId, and all submitted fields unchanged |
| P6: Zod rejects malformed payloads | Generate invalid payloads for each schema (titles >100 chars, descriptions >2000 chars, invalid emails, short passwords, missing fields); assert 400 with field-level errors and no DB write |
| P7: Staff status constraint | Generate status values outside ["In Progress", "Resolved", "Rejected"]; assert 400 rejection and complaint unchanged |
| P8: Resolution note required | Generate "Resolved" status updates without resolutionNote; assert rejection and status unchanged |
| P9: Staff ownership enforcement | Generate complaints assigned to different staff IDs; assert 403 for non-owner and complaint unchanged |
| P10: Password never in response | Generate users; call all auth and user endpoints; assert no response body contains password field |
| P11: Student role immutability | Generate profile updates with role field from student; assert role unchanged after update |
| P12: Analytics aggregation consistency | Generate complaints with mixed statuses and categories; assert analytics counts match manual aggregation for each status, category, and open total |
| P13: Assign sets Under Review | Generate assignment actions; assert assignedTo is set and status becomes "Under Review" |
| P14: Complaint deletion is permanent | Create complaint; delete it; assert subsequent GET returns 404 |
| P15: RBAC rejects unauthorized access | Generate requests without JWT (assert 401) and with wrong-role JWT (assert 403) for each protected route |

### Test Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterFramework: ['./jest.setup.js'],
};

// Property test example
import fc from 'fast-check';

test('Feature: student-complaint-system, Property 1: password never stored in plaintext', async () => {
  await fc.assert(
    fc.asyncProperty(fc.string({ minLength: 8 }), async (password) => {
      const hash = await bcrypt.hash(password, 10);
      expect(hash).not.toBe(password);
      expect(await bcrypt.compare(password, hash)).toBe(true);
    }),
    { numRuns: 100 }
  );
});
```

### Testing Pyramid

```
         /\
        /  \   E2E (Playwright — smoke tests for critical flows)
       /----\
      /      \  Integration (API routes + MongoDB in-memory)
     /--------\
    /          \ Unit + Property (Jest + fast-check)
   /____________\
```

- **Unit + Property**: Business logic, validators, service functions — fast, isolated
- **Integration**: API routes with `mongodb-memory-server` — verifies wiring
- **E2E Smoke**: Login → submit complaint → admin assigns → staff resolves — critical path only
