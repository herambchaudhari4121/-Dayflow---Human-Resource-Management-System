import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            DayFlow HRMS - Admin Panel
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/employees")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Manage Employees
            </button>
            <button
              onClick={() => navigate("/attendance")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
            >
              Attendance
            </button>
            <button
              onClick={() => navigate("/timeoff")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
            >
              Time Off
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h2>
          <p className="text-gray-600">Admin/HR Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/employees")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">👥 Employees</h3>
            <p className="text-gray-600">Manage all employees</p>
          </div>

          <div
            onClick={() => navigate("/attendance")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">📋 Attendance</h3>
            <p className="text-gray-600">View all attendance records</p>
          </div>

          <div
            onClick={() => navigate("/timeoff")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">🏖️ Time Off</h3>
            <p className="text-gray-600">Approve/reject leave requests</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">💰 Payroll</h3>
            <p className="text-gray-600">Manage payroll and salary</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">📊 Reports</h3>
            <p className="text-gray-600">Generate and view reports</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">⚙️ Settings</h3>
            <p className="text-gray-600">System configuration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
