import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {
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
          <div className="flex items-center gap-4">
            <img
              src="/logo (2).png"
              alt="DayFlow Logo"
              className="h-10 w-auto cursor-pointer"
              onClick={() => navigate("/admin/dashboard")}
            />
            <h1 className="text-2xl font-bold text-gray-800">DayFlow HRMS</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/employees")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              View Employees
            </button>
            <button
              onClick={() => navigate("/attendance")}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md"
            >
              My Attendance
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
          <p className="text-gray-600">Employee Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/profile")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">👤 Profile</h3>
            <p className="text-gray-600">View and edit your profile</p>
          </div>

          <div
            onClick={() => navigate("/attendance")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">📋 Attendance</h3>
            <p className="text-gray-600">Check-in/Check-out & View History</p>
          </div>

          <div
            onClick={() => navigate("/timeoff")}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">🏖️ Time Off</h3>
            <p className="text-gray-600">Request and view time off</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
