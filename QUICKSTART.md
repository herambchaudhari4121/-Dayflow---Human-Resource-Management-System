# DayFlow HRMS - Quick Start Guide

## ✅ Setup Complete!

Your DayFlow HRMS application has been successfully created with:

- ✅ React frontend with Tailwind CSS (Vite)
- ✅ Express.js backend
- ✅ MongoDB database integration
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Sign In & Sign Up pages

## 🚀 Running the Application

### Option 1: Use the Start Script (Recommended)

```bash
./start.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm run dev
```

## 🌐 Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 🧪 Testing the Application

### 1. Test Sign Up

**Open your browser and go to:** http://localhost:5173/signup

Fill in the form:

- Company Name: Odoo India
- Name: John Doe
- Email: john.doe@example.com
- Phone: +1234567890
- Password: password123
- Confirm Password: password123
- Upload a logo (optional)

**Expected Result:**

- Employee ID will be auto-generated: `OIJO20260001`
- Success message
- Redirect to Sign In page

### 2. Test Sign In

**Go to:** http://localhost:5173/signin

Use the credentials you just created:

- Email: john.doe@example.com
- Password: password123

**Expected Result:**

- For employees: Redirect to `/employee/dashboard`
- For admin/HR: Redirect to `/admin/dashboard`

### 3. Test API Endpoints with cURL

**Sign Up:**

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "name": "Alice Smith",
    "email": "alice@test.com",
    "phone": "+9876543210",
    "password": "securePass123",
    "role": "employee"
  }'
```

**Sign In:**

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type": application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "securePass123"
  }'
```

**Get User Profile (Protected Route):**

```bash
# Replace YOUR_TOKEN_HERE with the token received from sign in
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📁 Project Structure

```
DayFlow/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── SignIn.jsx
│   │   │   │   └── SignUp.jsx
│   │   │   └── Dashboard/
│   │   │       ├── EmployeeDashboard.jsx
│   │   │       └── AdminDashboard.jsx
│   │   ├── utils/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js          # MongoDB connection
│   │   ├── models/
│   │   │   └── User.js        # User schema
│   │   ├── routes/
│   │   │   └── authRoutes.js  # Auth routes
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   └── middleware/
│   │       └── auth.js        # JWT middleware
│   ├── uploads/               # File uploads
│   ├── .env                   # Environment variables
│   ├── server.js             # Entry point
│   └── package.json
│
├── README.md
└── start.sh                   # Start script
```

## 🔐 Employee ID Format

The system automatically generates Employee IDs in this format:

```
[CompanyCode][NameCode][Year][Serial]
```

**Example:** `OIJO20260001`

- `OI` = First 2 letters of company name (Odoo India)
- `JO` = First 2 letters of first & last name (John Doe)
- `2026` = Year of joining
- `0001` = Serial number (auto-increments)

## 👥 User Roles

### Employee

- View personal dashboard
- View/edit own profile
- Mark attendance
- Apply for leave
- View salary (read-only)

### Admin/HR

- All employee permissions
- View all employees
- Approve/reject leave
- Manage payroll
- Generate reports

## 🔑 Default Test Accounts

After running the app, create these accounts for testing:

**Admin Account:**

- Name: Admin User
- Email: admin@dayflow.com
- Password: admin123
- Role: admin

**Employee Account:**

- Name: Test Employee
- Email: employee@dayflow.com
- Password: emp123
- Role: employee

## 🛠️ Available Scripts

### Backend (server/)

```bash
npm start          # Production mode
npm run dev        # Development mode with nodemon
```

### Frontend (client/)

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📝 Environment Variables

Located in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

## 🐛 Troubleshooting

### MongoDB not running

```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Port already in use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Clear node_modules and reinstall

```bash
# Backend
cd server
rm -rf node_modules package-lock.json
npm install

# Frontend
cd ../client
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. ✅ Test Sign Up and Sign In functionality
2. ✅ Verify role-based routing works
3. ⬜ Implement Attendance Management
4. ⬜ Implement Leave Management
5. ⬜ Implement Payroll System
6. ⬜ Add Email Notifications
7. ⬜ Add Profile Picture Upload
8. ⬜ Implement Password Reset
9. ⬜ Add Dashboard Analytics
10. ⬜ Implement Report Generation

## 🎨 Design Features Implemented

✅ Purple gradient theme (matching design)
✅ Clean, modern UI with rounded corners
✅ Responsive design
✅ Password visibility toggle
✅ Logo upload functionality
✅ Form validation
✅ Error handling
✅ Loading states
✅ Protected routes

## 📱 Pages Implemented

1. **Sign In Page** (`/signin`)

   - Email/password login
   - "Don't have an account" link
   - Role-based dashboard redirection

2. **Sign Up Page** (`/signup`)

   - Company registration form
   - Logo upload
   - Auto-generated employee ID
   - Password confirmation
   - Information note section

3. **Employee Dashboard** (`/employee/dashboard`)

   - Personal profile card
   - Attendance card
   - Leave requests card
   - Protected route (employees only)

4. **Admin Dashboard** (`/admin/dashboard`)
   - Employee management
   - Attendance overview
   - Leave approvals
   - Payroll management
   - Reports
   - Settings
   - Protected route (admin/HR only)

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Health

- `GET /api/health` - Server health check

## 💡 Tips

- Use Chrome DevTools to inspect network requests
- Check MongoDB Compass to view database records
- Use Redux DevTools for state management (if implementing Redux)
- Enable React Developer Tools for component debugging

---

**Built with ❤️ for DayFlow HRMS**

Need help? Check the main README.md or create an issue!
