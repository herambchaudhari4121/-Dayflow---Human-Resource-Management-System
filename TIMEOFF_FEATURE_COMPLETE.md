# Time Off/Leave Management Feature - Complete ✅

## Overview

Comprehensive leave management system with role-based access control allowing employees to request time off and admins/HR to approve or reject requests.

## Backend Implementation

### 1. Database Model (`/server/src/models/Leave.js`)

- **Schema Fields:**

  - `employee`: Reference to User model
  - `startDate`: Leave start date
  - `endDate`: Leave end date
  - `leaveType`: Enum (Paid Time Off, Sick Time Off, Unpaid Leave, Other)
  - `status`: Enum (pending, approved, rejected)
  - `reason`: Employee's reason for leave
  - `daysCount`: Auto-calculated number of days
  - `approvedBy`: Reference to admin/HR who approved
  - `approvedAt`: Approval timestamp
  - `rejectionReason`: Reason if rejected

- **Features:**
  - Pre-save hook to auto-calculate `daysCount`
  - Indexed for performance
  - Timestamps enabled

### 2. Controller (`/server/src/controllers/leaveController.js`)

**Six main functions:**

#### `createLeaveRequest` (POST /)

- Employees submit leave requests
- Status defaults to "pending"
- Validates required fields

#### `getMyLeaves` (GET /my-leaves)

- Employees view their own leave requests
- Returns statistics:
  - Paid Time Off: 24 days available per year
  - Sick Time Off: 7 days available per year
  - Calculates days used vs available

#### `getAllLeaves` (GET /all)

- Admins/HR view all employee leaves
- Optional status filter (?status=pending)
- Populates employee details

#### `approveLeave` (PUT /:id/approve)

- Admin/HR approve pending requests
- Records approver and timestamp
- Status changed to "approved"

#### `rejectLeave` (PUT /:id/reject)

- Admin/HR reject pending requests
- Requires rejection reason
- Status changed to "rejected"

#### `deleteLeave` (DELETE /:id)

- Delete leave requests
- Only pending requests can be deleted
- Authorization check

### 3. Routes (`/server/src/routes/leaveRoutes.js`)

**Employee Routes:**

- POST `/api/leaves` - Submit leave request
- GET `/api/leaves/my-leaves` - View own leaves with statistics
- DELETE `/api/leaves/:id` - Delete own pending request

**Admin/HR Routes:**

- GET `/api/leaves/all` - View all leaves (with optional status filter)
- PUT `/api/leaves/:id/approve` - Approve leave request
- PUT `/api/leaves/:id/reject` - Reject leave request

**Middleware:**

- `protect`: Authentication required for all routes
- `authorizeRoles(['admin', 'hr'])`: Admin/HR only routes

### 4. Server Integration (`/server/server.js`)

- Leave routes integrated: `app.use("/api/leaves", leaveRoutes)`

## Frontend Implementation

### TimeOffPage Component (`/client/src/components/Dashboard/TimeOffPage.jsx`)

#### Role-Based Views

**Employee View:**

- **Statistics Display:**
  - Paid Time Off: 24 Days Available
  - Sick Time Off: 7 Days Available
- **Request Button:** "+ Request Time Off"
- **Request Modal:**
  - Start Date picker
  - End Date picker
  - Leave Type dropdown (Paid/Sick/Unpaid/Other)
  - Reason textarea
  - Submit/Cancel buttons
- **Personal Leave List:**
  - Table showing own requests
  - Columns: Start Date, End Date, Type, Status
  - Status badges (Pending/Approved/Rejected)

**Admin/HR View:**

- **Search Bar:** Filter employees by name
- **All Leaves Table:**
  - Columns: Name, Start Date, End Date, Type, Status, Actions
  - Shows all employee leave requests
- **Action Buttons:**
  - ❌ Reject (red button) - Prompts for reason
  - ✓ Approve (green button) - One-click approval
  - Only visible for "pending" requests
  - Disabled after approval/rejection

#### Features

- **Real-time Statistics:** Days available calculated from backend
- **Status Color Coding:**
  - Pending: Yellow badge
  - Approved: Green badge
  - Rejected: Red badge
- **Responsive Design:** Mobile-friendly table layout
- **Loading States:** Spinner during data fetch
- **Empty States:** Message when no leaves found
- **Error Handling:** Alert messages for failures
- **Date Formatting:** DD/MM/YYYY display format

### Navigation Integration

#### AdminDashboard Updates

- Added "Time Off" button in header (green)
- Updated dashboard card to link to `/timeoff`
- Card icon changed to 🏖️

#### EmployeeDashboard Updates

- Added "Time Off" button in header (green)
- Updated dashboard card to link to `/timeoff`
- Card text: "Request and view time off"

#### App.jsx Route

```jsx
<Route
  path="/timeoff"
  element={
    <ProtectedRoute allowedRoles={["employee", "admin", "hr"]}>
      <TimeOffPage />
    </ProtectedRoute>
  }
/>
```

## API Endpoints Summary

| Method | Endpoint                  | Role     | Description                 |
| ------ | ------------------------- | -------- | --------------------------- |
| POST   | `/api/leaves`             | All      | Submit leave request        |
| GET    | `/api/leaves/my-leaves`   | All      | Get own leaves + statistics |
| GET    | `/api/leaves/all`         | Admin/HR | Get all leaves              |
| PUT    | `/api/leaves/:id/approve` | Admin/HR | Approve request             |
| PUT    | `/api/leaves/:id/reject`  | Admin/HR | Reject request              |
| DELETE | `/api/leaves/:id`         | All      | Delete pending request      |

## Testing Instructions

### As Employee:

1. Login: `employee@dayflow.com` / `employee123`
2. Navigate to Time Off page
3. View statistics (24 paid, 7 sick days)
4. Click "+ Request Time Off"
5. Fill form and submit
6. View request in table with "PENDING" status

### As Admin/HR:

1. Login: `admin@dayflow.com` / `admin123`
2. Navigate to Time Off page
3. View all employee requests
4. Click ✓ to approve or ❌ to reject
5. For rejection, provide reason in prompt
6. Status updates immediately

## Statistics Calculation

- **Paid Time Off:** 24 days per year (configurable in backend)
- **Sick Time Off:** 7 days per year (configurable in backend)
- **Days Used:** Sum of approved leave days by type
- **Days Available:** Total - Used

## Security Features

- JWT authentication required
- Role-based authorization
- Only pending requests can be modified
- Employees can only view/manage own requests
- Admins/HR can view/manage all requests
- Approval tracking (who approved, when)

## Design Compliance

✅ Matches provided design image
✅ NEW badge for employees
✅ Dual-view system (employee vs admin)
✅ Statistics bar with day counts
✅ Table layout with action buttons
✅ Note box explaining role access
✅ Color-coded status badges
✅ Responsive controls panel

## Next Steps (Future Enhancements)

- [ ] Email notifications on approval/rejection
- [ ] Leave balance carry-over logic
- [ ] Holiday calendar integration
- [ ] Bulk approval functionality
- [ ] Leave history reports
- [ ] Export to PDF/Excel
- [ ] Leave type customization
- [ ] Multi-level approval workflow

## Files Created/Modified

### Created:

- `/server/src/models/Leave.js`
- `/server/src/controllers/leaveController.js`
- `/server/src/routes/leaveRoutes.js`
- `/client/src/components/Dashboard/TimeOffPage.jsx`
- `/TIMEOFF_FEATURE_COMPLETE.md`

### Modified:

- `/server/server.js` - Added leave routes
- `/client/src/App.jsx` - Added /timeoff route
- `/client/src/components/Dashboard/AdminDashboard.jsx` - Added navigation
- `/client/src/components/Dashboard/EmployeeDashboard.jsx` - Added navigation

## Status: ✅ COMPLETE AND FUNCTIONAL

Backend and frontend fully implemented with role-based access control and approval workflow.
