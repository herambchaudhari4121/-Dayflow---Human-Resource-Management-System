# DayFlow - Human Resource Management System

> "Every workday, perfectly aligned."

A comprehensive HRMS built with React, Express.js, and MongoDB featuring role-based access control, attendance management, leave management, and payroll systems.

## 🚀 Features

- **Role-Based Access Control (RBAC)**
  - Employee Dashboard
  - Admin/HR Dashboard
- **Authentication System**

  - Secure Sign Up & Sign In
  - JWT-based authentication
  - Auto-generated Employee IDs
  - Password hashing with bcrypt

- **Employee Management**
  - Profile management
  - Auto-generated employee IDs (Format: [CompanyCode][NameCode][Year][Serial])
- **Dashboard**
  - Employee-specific dashboard
  - Admin/HR management panel

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd DayFlow
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
```

## 🚀 Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Linux/Mac
sudo systemctl start mongod

# Or using mongod directly
mongod --dbpath /path/to/your/data/directory
```

### Start Backend Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

### Start Frontend Development Server

Open a new terminal:

```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173` (Vite default port)

## 📁 Project Structure

```
DayFlow/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/       # Authentication components
│   │   │   │   ├── SignIn.jsx
│   │   │   │   └── SignUp.jsx
│   │   │   └── Dashboard/  # Dashboard components
│   │   │       ├── EmployeeDashboard.jsx
│   │   │       └── AdminDashboard.jsx
│   │   ├── utils/          # Utility functions
│   │   │   └── ProtectedRoute.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
└── server/                 # Express backend
    ├── src/
    │   ├── config/         # Configuration files
    │   │   └── db.js
    │   ├── models/         # Mongoose models
    │   │   └── User.js
    │   ├── routes/         # API routes
    │   │   └── authRoutes.js
    │   ├── controllers/    # Route controllers
    │   │   └── authController.js
    │   └── middleware/     # Custom middleware
    │       └── auth.js
    ├── uploads/            # File uploads directory
    ├── .env
    ├── server.js
    └── package.json
```

## 🔐 User Roles

### Employee

- Access to personal dashboard
- View own profile
- Mark attendance
- Apply for leave
- View salary information (read-only)

### Admin/HR

- Access to admin dashboard
- Manage all employees
- View all attendance records
- Approve/reject leave requests
- Manage payroll
- Generate reports

## 📝 Employee ID Format

Employee IDs are automatically generated in the format:

```
[CompanyCode][NameCode][Year][Serial]
```

Example: `OIJO20220001`

- `OI` - First two letters of company name (Odoo India)
- `JO` - First two letters of first and last name (John Doe)
- `2022` - Year of joining
- `0001` - Serial number

## 🔒 Security Features

- Password hashing using bcrypt
- JWT token-based authentication
- Protected routes with role-based authorization
- HTTP-only cookies (can be implemented)
- Input validation
- CORS configuration

## 📱 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Health Check

- `GET /api/health` - Server health check

## 🎨 Tech Stack

### Frontend

- React 19.2.0
- React Router DOM
- Tailwind CSS
- Axios
- Vite

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Multer (file uploads)

## 🚧 Future Enhancements

- [ ] Biometric attendance
- [ ] Shift management
- [ ] Performance reviews
- [ ] Tax computation
- [ ] Export reports (PDF/Excel)
- [ ] Email notifications
- [ ] Document management
- [ ] Advanced analytics

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@dayflow.com or open an issue in the repository.

---

Built with ❤️ by the DayFlow Team
