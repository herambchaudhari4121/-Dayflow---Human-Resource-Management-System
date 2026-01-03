import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import EmployeeDashboard from "./components/Dashboard/EmployeeDashboard";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import EmployeesPage from "./components/Dashboard/EmployeesPage";
import EmployeeProfile from "./components/Dashboard/EmployeeProfile";
import AttendancePage from "./components/Dashboard/AttendancePage";
import TimeOffPage from "./components/Dashboard/TimeOffPage";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "hr"]}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "hr"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "hr"]}>
              <EmployeeProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "hr"]}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/timeoff"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "hr"]}>
              <TimeOffPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Unauthorized Access
                </h1>
                <p className="text-gray-600">
                  You don't have permission to access this page.
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
