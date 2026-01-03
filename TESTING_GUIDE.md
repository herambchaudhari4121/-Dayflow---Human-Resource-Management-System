# 🧪 TESTING GUIDE - Admin vs Employee Views

## 📋 Test Accounts Created

| Role                | Email                    | Password        | Access Level                         |
| ------------------- | ------------------------ | --------------- | ------------------------------------ |
| 🔴 **ADMIN**        | admin@dayflow.com        | admin123        | Full access to all profiles + salary |
| 🟡 **HR**           | hr@dayflow.com           | hr123           | Full access to all profiles + salary |
| 🟢 **EMPLOYEE**     | employee@dayflow.com     | emp123          | Only own profile (no salary view)    |
| 🟢 **YOUR ACCOUNT** | utsavhirapra21@gmail.com | (your password) | Only own profile (no salary view)    |

---

## 🎯 Step-by-Step Testing

### TEST 1: Login as ADMIN 🔴

1. **Logout** if currently logged in (click profile → Log Out)
2. **Login with:**
   - Email: `admin@dayflow.com`
   - Password: `admin123`
3. **Go to Employees page** (should redirect automatically)
4. **Click on ANY employee card** (try clicking "John Doe" or "Utsav hirapra")

   ✅ **What you should see:**

   - Profile opens successfully
   - **4 TABS visible:** Profile Info, **Salary Info**, Attendance, Time Off
   - "Important" notes box on the left side
   - Edit button works for all fields
   - Can view and modify salary details

5. **Click on Salary Info tab:**
   - Yellow warning banner: "Admin Only: Salary information..."
   - Monthly Wage field
   - Yearly Wage (auto-calculated)
   - Salary Components section
   - Total salary highlighted in purple

---

### TEST 2: Login as EMPLOYEE 🟢

1. **Logout** (click profile → Log Out)
2. **Login with:**
   - Email: `employee@dayflow.com`
   - Password: `emp123`
3. **Go to Employees page**
4. **Click on YOUR OWN card** (John Doe)

   ✅ **What you should see:**

   - Profile opens successfully
   - **Only 3 TABS:** Profile Info, Attendance, Time Off
   - **NO Salary Info tab** (hidden)
   - **NO "Important" notes box**
   - Can edit personal details (phone, address, etc.)

5. **Try clicking ANOTHER employee's card:**

   - Click on "Admin User" or "Utsav hirapra"

   ❌ **What should happen:**

   - Alert message: "You can only view your own profile"
   - Profile does NOT open

---

## 🔍 Key Differences to Observe

| Feature             | Admin View                       | Employee View            |
| ------------------- | -------------------------------- | ------------------------ |
| **Tabs**            | 4 tabs (includes Salary Info)    | 3 tabs (no Salary Info)  |
| **Other Profiles**  | Can click any employee card      | Cannot click other cards |
| **Salary Section**  | ✅ Visible with full edit access | ❌ Hidden completely     |
| **Important Notes** | ✅ Visible on left side          | ❌ Hidden                |
| **Edit Access**     | All profiles                     | Only own profile         |
| **Navigation**      | `/profile/:id` for any user      | `/profile` only          |

---

## 🎬 Quick Test Scenarios

### Scenario A: Admin Edits Employee Salary

1. Login as `admin@dayflow.com`
2. Go to Employees → Click "John Doe"
3. Click **Salary Info** tab
4. Click **Edit** button
5. Change values:
   - Basic Salary: `55000`
   - Allowances: `15000`
   - Deductions: `6000`
6. Observe **Total Monthly Salary** updates to: `₹64,000`
7. Click **Save**
8. Logout and login as `employee@dayflow.com`
9. Go to your profile → Verify you **CANNOT see** salary tab

### Scenario B: Employee Tries to View Other Profile

1. Login as `employee@dayflow.com`
2. Go to Employees page
3. Try clicking "Admin User" card
4. Should get alert: "You can only view your own profile"
5. Click your own card (John Doe)
6. Should open successfully with 3 tabs

### Scenario C: Check "My Profile" Button

1. Login as any user
2. Click profile icon (top right)
3. Click "My Profile"
4. Should open your own profile at `/profile`

---

## ✅ Checklist for Complete Testing

- [ ] Admin can see 4 tabs (including Salary Info)
- [ ] Admin can click any employee card
- [ ] Admin sees "Important" notes box
- [ ] Admin can edit salary components
- [ ] Total salary calculations work correctly
- [ ] Employee sees only 3 tabs (no Salary Info)
- [ ] Employee gets alert when clicking other cards
- [ ] Employee can click own card successfully
- [ ] Employee does NOT see "Important" notes
- [ ] "My Profile" button works for both roles
- [ ] Logout and login switch works properly
- [ ] Edit/Save/Cancel buttons work
- [ ] Back button returns to employees page

---

## 🐛 If Something Doesn't Work

1. **Check console** (F12 → Console tab) for errors
2. **Check network** (F12 → Network tab) for failed API calls
3. **Clear browser cache** and reload
4. **Check backend is running** on port 5000
5. **Verify you're logged in** with correct role

---

## 📊 Visual Indicators

### Admin View Features:

- 🟣 Purple "Salary Info" tab
- 📝 "Important" section (left sidebar)
- ⚠️ Yellow admin warning banner
- 💰 Total salary in large purple text
- ✏️ Edit access to all fields

### Employee View Features:

- 👤 Only personal info
- 🚫 No salary tab visible
- 🔒 Restricted to own profile
- ✏️ Can edit: phone, address, personal details
- 🚫 Cannot edit: email, employee ID, role

---

## 🎉 Success Criteria

You'll know it's working correctly when:

1. ✅ Admin login shows Salary tab
2. ✅ Employee login hides Salary tab
3. ✅ Employee can't click other profiles
4. ✅ Salary calculations update in real-time
5. ✅ Role-based restrictions are enforced
6. ✅ Navigation works properly for both roles

---

**Ready to test? Go to http://localhost:5175 and start with admin@dayflow.com!** 🚀
