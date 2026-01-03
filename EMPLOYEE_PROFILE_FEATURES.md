# Employee Profile Page - Complete Implementation

## ✅ Features Implemented

### 1. **Profile Overview (Left Column)**

- Circular avatar with initials
- Employee name and ID
- Role badge
- Quick info: Email, Phone, Department, Joining Date
- Profile picture upload button (visible in edit mode)

### 2. **Four Main Tabs**

#### Tab 1: Profile Info

- Personal Information section with fields:
  - Employee Name (editable)
  - Login ID (read-only - Employee ID)
  - Email (read-only)
  - Phone (editable)
  - Designation (editable)
  - Department (editable)
  - Date of Birth (editable)
  - Joining Date (read-only)
  - Address (editable textarea)
- About section (for bio/notes)
- Edit/Save/Cancel buttons in header

#### Tab 2: Salary Info (Admin/HR Only)

- ⚠️ **Admin-Only Warning Banner**
- Monthly Wage input
- Yearly Wage (auto-calculated: monthly × 12)
- Salary Components:
  - House Rent Allowances (with hourly rate calculation)
  - Deductions (with hourly rate calculation)
- **Total Salary Display:**
  - Total Monthly Salary (highlighted in purple)
  - Total Yearly Salary
- Formula: `Total = Basic + Allowances - Deductions`

#### Tab 3: Attendance

- Placeholder for attendance history
- Ready for integration

#### Tab 4: Time Off

- Placeholder for leave requests
- Ready for integration

### 3. **Important Notes Section (Admin Only)**

- Guidelines for salary information
- Wage type information
- Salary component details
- Automatic calculation examples
- Styled in a separate card below profile

### 4. **Access Control**

- **Employees:** Can only view/edit their own profile
- **Admin/HR:** Can view/edit any employee profile
- Salary tab only visible to Admin/HR roles

### 5. **Navigation**

- Back button to return to previous page
- Edit button to enable editing
- Save/Cancel buttons when editing
- Clickable employee cards in EmployeesPage navigate to profile
- "My Profile" in dropdown menu navigates to `/profile`

## 🔗 Routes

| Route          | Access                  | Description                    |
| -------------- | ----------------------- | ------------------------------ |
| `/profile`     | All authenticated users | View/edit own profile          |
| `/profile/:id` | Admin/HR only           | View/edit any employee profile |

## 🎨 UI Features

- **Responsive Design:** Grid layout adapts to screen size
- **Loading States:** Spinner while fetching data
- **Error Handling:** User-friendly error messages
- **Disabled States:** Save button disabled while saving
- **Visual Feedback:** Hover effects, smooth transitions
- **Color-coded sections:** Purple theme for important calculations

## 📊 Data Structure

### Frontend State

```javascript
formData = {
  name: string,
  email: string,
  phone: string,
  designation: string,
  department: string,
  address: string,
  dateOfBirth: string(YYYY - MM - DD),
  joiningDate: string(YYYY - MM - DD),
  basicSalary: number,
  allowances: number,
  deductions: number,
};
```

### Backend Model (User.js)

```javascript
salaryStructure: {
  basicSalary: Number (default: 0),
  allowances: Number (default: 0),
  deductions: Number (default: 0)
}
```

## 🧮 Salary Calculations

### Hourly Rate Formula

```javascript
hourlyRate = monthlyAmount / 160;
// Assumes 160 working hours per month
```

### Total Salary Formula

```javascript
totalMonthlySalary = basicSalary + allowances - deductions
totalYearlySalary = totalMonthlySalary × 12
```

## 🔒 Security

- JWT authentication required for all API calls
- Role-based access control (RBAC)
- Salary information only accessible to Admin/HR
- Users can only edit their own profiles (unless Admin/HR)
- Password field excluded from API responses

## 📡 API Endpoints Used

| Method | Endpoint             | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/api/employees/:id` | Fetch employee data  |
| PUT    | `/api/employees/:id` | Update employee data |

## 🎯 Testing Steps

1. **As Employee:**

   - Login as employee
   - Go to Employees page
   - Click on your own card → Should navigate to `/profile`
   - Click "My Profile" in dropdown → Should navigate to `/profile`
   - Click Edit → Modify phone/address → Save
   - **Should NOT see Salary Info tab**
   - Try clicking another employee card → Should get "You can only view your own profile" alert

2. **As Admin/HR:**

   - Login as admin or hr
   - Go to Employees page
   - Click any employee card → Should navigate to `/profile/:id`
   - **Should see all 4 tabs including Salary Info**
   - Switch to Salary Info tab
   - Click Edit → Modify salary components → Save
   - Verify total salary calculations update in real-time
   - Check "Important" notes section is visible

3. **Salary Calculation Test:**
   - Set Basic Salary: ₹50,000
   - Set Allowances: ₹12,000
   - Set Deductions: ₹5,000
   - **Expected Results:**
     - Total Monthly: ₹57,000
     - Total Yearly: ₹6,84,000
     - Allowances hourly: ₹75.00/hr
     - Deductions hourly: ₹31.25/hr

## 🚀 Next Steps (Future Enhancements)

- [ ] Implement Attendance tab with history
- [ ] Implement Time Off tab with leave requests
- [ ] Add profile picture upload functionality
- [ ] Add more salary components (HRA, Medical, Bonus, etc.)
- [ ] Percentage-based salary component calculations
- [ ] Salary history tracking
- [ ] Download profile as PDF
- [ ] Email notifications on profile updates

## 📝 Notes

- All dates are displayed in locale format (e.g., 1/3/2026)
- Currency symbol is hardcoded as ₹ (Indian Rupee)
- Avatar shows initials from name (first letter of each word)
- Form validation happens before save
- Changes require explicit "Save" action (no auto-save)
