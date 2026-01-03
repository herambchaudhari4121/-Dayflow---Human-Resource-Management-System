import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EmployeesPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("employees");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [checkInStatus, setCheckInStatus] = useState("checked-out");
  const [checkInTime, setCheckInTime] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [error, setError] = useState("");

  // Fetch employees from backend
  useEffect(() => {
    fetchEmployees();
    fetchTodayAttendance();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setEmployees(response.data.employees || []);
      setError("");
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/attendance/today",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { attendance, status } = response.data;
      setCheckInStatus(status);

      if (attendance && attendance.checkInTime) {
        setCheckInTime(new Date(attendance.checkInTime).toLocaleTimeString());
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleCheckIn = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/attendance/checkin",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCheckInStatus("checked-in");
      setCheckInTime(new Date().toLocaleTimeString());
      alert(response.data.message || "Checked In successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to check in");
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/attendance/checkout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCheckInStatus("checked-out");
      setCheckInTime(null);
      alert(response.data.message || "Checked Out successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to check out");
    }
  };

  const handleEmployeeClick = (employee) => {
    // Navigate to employee profile page
    // Admin/HR can view any profile, employees can view their own
    if (user.role === "admin" || user.role === "hr") {
      navigate(`/profile/${employee._id}`);
    } else if (employee._id === user.id) {
      navigate("/profile");
    } else {
      alert("You can only view your own profile");
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (employee) => {
    // For now, show all employees as present (green)
    // In future, this will be based on actual attendance data
    return "bg-green-500";
  };

  const getStatusIcon = (employee) => {
    // Check if employee is on leave (future implementation)
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEmployees}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div
                className="mr-6 flex items-center cursor-pointer"
                onClick={() => navigate("/admin/dashboard")}
              >
                <img
                  src="/logo (2).png"
                  alt="DayFlow Logo"
                  className="h-10 w-auto"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-800">DayFlow HRMS</h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/attendance")}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
              >
                Attendance
              </button>
              <button
                onClick={() => navigate("/timeoff")}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Time Off
              </button>
            </div>

            {/* Profile Section */}
            <div className="relative">
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name?.charAt(0) || "U"}
                  </div>
                  {checkInStatus === "checked-in" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {checkInStatus === "checked-out" && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <span className="text-gray-700 font-medium">{user.name}</span>
              </div>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/attendance");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Attendance
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate("/timeoff");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Time Off
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("employees")}
              className={`pb-4 px-2 font-medium ${
                activeTab === "employees"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab("attendance")}
              className={`pb-4 px-2 font-medium ${
                activeTab === "attendance"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab("timeoff")}
              className={`pb-4 px-2 font-medium ${
                activeTab === "timeoff"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Time Off
            </button>
          </div>
        </div>

        {/* Employees Tab Content */}
        {activeTab === "employees" && (
          <>
            {/* Search Bar and NEW Button */}
            <div className="flex justify-between items-center mb-6">
              <button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-2 rounded-md font-semibold hover:from-pink-600 hover:to-purple-600 transition-all">
                NEW
              </button>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Employee Cards Grid */}
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? "No employees found matching your search"
                    : "No employees in the system yet"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    onClick={() => handleEmployeeClick(employee)}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow relative"
                  >
                    {/* Status Indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {getStatusIcon(employee) && (
                        <span className="text-lg">
                          {getStatusIcon(employee)}
                        </span>
                      )}
                      <div
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          employee
                        )}`}
                      ></div>
                    </div>

                    {/* Profile Picture */}
                    <div className="flex justify-center mb-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    </div>

                    {/* Employee Info */}
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-800 mb-1">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {employee.employeeId}
                      </p>
                      {employee.designation && (
                        <p className="text-xs text-gray-400 mt-1">
                          {employee.designation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Attendance Tab Content */}
        {activeTab === "attendance" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Attendance System
            </h2>

            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">Current Status:</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      checkInStatus === "checked-in"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  ></div>
                  <span className="font-semibold text-lg">
                    {checkInStatus === "checked-in"
                      ? "Checked In"
                      : "Checked Out"}
                  </span>
                </div>
                {checkInTime && checkInStatus === "checked-in" && (
                  <p className="text-sm text-gray-500 mt-2">
                    Since: {checkInTime}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleCheckIn}
                  disabled={checkInStatus === "checked-in"}
                  className={`w-full py-3 rounded-md font-semibold transition-all ${
                    checkInStatus === "checked-in"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-500 text-white hover:bg-green-600"
                  }`}
                >
                  Check In →
                </button>

                <button
                  onClick={handleCheckOut}
                  disabled={checkInStatus === "checked-out"}
                  className={`w-full py-3 rounded-md font-semibold transition-all ${
                    checkInStatus === "checked-out"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                  }`}
                >
                  Check Out →
                </button>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Status Indicators:
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Green dot: Employee is present in the office</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">✈️</span>
                    <span>Airplane icon: Employee is on leave</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>
                      Yellow dot: Employee is absent (hasn't applied time off)
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Time Off Tab Content */}
        {activeTab === "timeoff" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Time Off Requests
            </h2>
            <p className="text-gray-600">
              Time off management module will be implemented here.
            </p>
            <button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-md hover:from-purple-600 hover:to-pink-600">
              Request Time Off
            </button>
          </div>
        )}

        {/* Settings Button (Bottom Right) */}
        <button
          className="fixed bottom-8 right-8 bg-gray-600 text-white p-4 rounded-full shadow-lg hover:bg-gray-700 transition-all"
          onClick={() => alert("Settings panel coming soon!")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EmployeesPage;
