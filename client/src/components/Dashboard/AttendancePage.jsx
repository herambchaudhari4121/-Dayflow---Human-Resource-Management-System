import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AttendancePage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser.role === "admin" || currentUser.role === "hr";

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("date"); // 'date' or 'day'
  const [monthYear, setMonthYear] = useState({
    month: new Date().getMonth(), // 0-11
    year: new Date().getFullYear(),
  });
  const [statistics, setStatistics] = useState({
    daysPresent: 0,
    leavesCount: 0,
    totalWorkingDays: 0,
  });

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (isAdmin) {
        // Admin can see all employees' attendance for selected date
        response = await axios.get(
          `http://localhost:5000/api/attendance/all?date=${selectedDate}`,
          config
        );
      } else {
        // Regular employees see their own attendance for the selected month
        const startDate = new Date(monthYear.year, monthYear.month, 1)
          .toISOString()
          .split("T")[0];
        const endDate = new Date(monthYear.year, monthYear.month + 1, 0)
          .toISOString()
          .split("T")[0];

        response = await axios.get(
          `http://localhost:5000/api/attendance/history?startDate=${startDate}&endDate=${endDate}&limit=100`,
          config
        );

        // Calculate statistics for employee view
        const records = response.data.attendance || [];
        const daysPresent = records.filter((r) => r.checkInTime).length;
        const totalDays = new Date(
          monthYear.year,
          monthYear.month + 1,
          0
        ).getDate();

        setStatistics({
          daysPresent,
          leavesCount: 0, // TODO: Fetch from leave system
          totalWorkingDays: totalDays,
        });
      }

      setAttendanceData(response.data.attendance || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      alert(
        error.response?.data?.message ||
          "Failed to fetch attendance data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, monthYear]);

  // Calculate work hours
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "N/A";
    const diff = new Date(checkOut) - new Date(checkIn);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  // Calculate extra hours (assuming 9 hours is standard)
  const calculateExtraHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "00:00";
    const diff = new Date(checkOut) - new Date(checkIn);
    const totalHours = diff / (1000 * 60 * 60);
    const standardHours = 9;
    const extraHours = Math.max(0, totalHours - standardHours);
    const hours = Math.floor(extraHours);
    const minutes = Math.floor((extraHours % 1) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}`;
  };

  // Format time
  const formatTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Navigate to previous day
  const previousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  // Navigate to next day
  const nextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  // Navigate to previous month
  const previousMonth = () => {
    setMonthYear((prev) => {
      const newMonth = prev.month === 0 ? 11 : prev.month - 1;
      const newYear = prev.month === 0 ? prev.year - 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setMonthYear((prev) => {
      const newMonth = prev.month === 11 ? 0 : prev.month + 1;
      const newYear = prev.month === 11 ? prev.year + 1 : prev.year;
      return { month: newMonth, year: newYear };
    });
  };

  // Get month name
  const getMonthName = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[monthYear.month]} ${monthYear.year}`;
  };

  // Filter data based on search
  const filteredData = attendanceData.filter((record) => {
    const employeeName = record.employee?.name?.toLowerCase() || "";
    const employeeId = record.employee?.employeeId?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return employeeName.includes(query) || employeeId.includes(query);
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <img
                src="/logo (2).png"
                alt="DayFlow Logo"
                className="h-10 w-auto cursor-pointer"
                onClick={() => navigate("/admin/dashboard")}
              />
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-gray-800">
                Attendance List View
                {isAdmin && (
                  <span className="text-sm font-normal text-purple-600 ml-2">
                    For Admin/HR Officer
                  </span>
                )}
              </h1>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/employees")}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
              >
                Employees
              </button>
              <button
                onClick={() => navigate("/timeoff")}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Time Off
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Information Note */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-3">📋 NOTE</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>
                If the employee's working source is based on the assigned
                attendance
              </strong>
            </p>
            <p>
              On the Attendance page, users should see a day-wise attendance of
              themselves by default for the current month, displaying details
              based on their working time, including breaks.
            </p>
            <p>
              <strong>For Admins/Time off officers:</strong> They can see
              attendance of all the employees present on the current day.
            </p>
            <p className="mt-3">
              Attendance data serves as the basis for payslip generation.
            </p>
            <p>
              The system should use the generated attendance records to
              determine the total number of payable days for each employee.
            </p>
            <p className="mt-2 text-blue-900 font-semibold">
              Any unpaid leave or missing attendance days should automatically
              reduce the number of payable days during payslip computation
            </p>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left side - Tabs */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Company Logo
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Employees
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md">
                Attendance
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Time Off
              </button>
            </div>

            {/* Right side - Settings icons */}
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                🔴
              </button>
              <button className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600">
                ⚙️
              </button>
            </div>
          </div>

          {/* Search and Date Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 font-medium">Attendance</label>
              {!isAdmin && (
                <input
                  type="text"
                  placeholder="Searchbar"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={isAdmin ? previousDay : previousMonth}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                &lt;-
              </button>
              <button
                onClick={isAdmin ? nextDay : nextMonth}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                -&gt;
              </button>
            </div>

            {isAdmin && (
              <>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("date")}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === "date"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Date ▼
                  </button>
                  <button
                    onClick={() => setViewMode("day")}
                    className={`px-4 py-2 rounded-md ${
                      viewMode === "day"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    Day
                  </button>
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </>
            )}

            {!isAdmin && (
              <>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                  Oct ▼
                </button>
                <div className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-600 mr-2">
                    Count of days present:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {statistics.daysPresent}
                  </span>
                </div>
                <div className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-600 mr-2">
                    Leaves count:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {statistics.leavesCount}
                  </span>
                </div>
                <div className="px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <span className="text-sm text-gray-600 mr-2">
                    Total working days:
                  </span>
                  <span className="font-semibold text-gray-900">
                    {statistics.totalWorkingDays}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Selected Date Display */}
          <div className="mt-4 text-center">
            <p className="text-lg font-semibold text-gray-800">
              {isAdmin ? formatDisplayDate(selectedDate) : getMonthName()}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-600">Loading attendance data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                {isAdmin
                  ? "No attendance records found for this date"
                  : "No attendance records found for this month"}
              </p>
              <p className="text-gray-400 mt-2">
                {isAdmin
                  ? "No employees have checked in yet today"
                  : "You have not marked attendance this month"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {isAdmin ? "Emp" : "Date"}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Extra Hours
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((record, index) => (
                    <tr
                      key={record._id || index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isAdmin ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {record.employee?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.employee?.employeeId || "N/A"}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            record.checkInTime
                              ? "text-green-600 font-semibold"
                              : "text-gray-400"
                          }`}
                        >
                          {formatTime(record.checkInTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm ${
                            record.checkOutTime
                              ? "text-red-600 font-semibold"
                              : "text-gray-400"
                          }`}
                        >
                          {formatTime(record.checkOutTime)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {calculateWorkHours(
                            record.checkInTime,
                            record.checkOutTime
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">
                          {calculateExtraHours(
                            record.checkInTime,
                            record.checkOutTime
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredData.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Checked In</p>
              <p className="text-2xl font-bold text-green-600">
                {
                  filteredData.filter((r) => r.checkInTime && !r.checkOutTime)
                    .length
                }
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Checked Out</p>
              <p className="text-2xl font-bold text-red-600">
                {
                  filteredData.filter((r) => r.checkInTime && r.checkOutTime)
                    .length
                }
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-gray-600 text-sm">Absent</p>
              <p className="text-2xl font-bold text-gray-400">
                {filteredData.filter((r) => !r.checkInTime).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
