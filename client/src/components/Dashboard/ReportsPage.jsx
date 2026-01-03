import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ReportsPage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser.role === "admin" || currentUser.role === "hr";

  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState("attendance");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [reportData, setReportData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/attendance/all?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.attendance || [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return [];
    }
  };

  const fetchLeaveData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/leaves/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.leaves || [];
    } catch (error) {
      console.error("Error fetching leaves:", error);
      return [];
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      if (reportType === "attendance") {
        const attendance = await fetchAttendanceData();
        setAttendanceData(attendance);
        generateAttendanceReport(attendance);
      } else if (reportType === "leave") {
        const leaves = await fetchLeaveData();
        setLeaveData(leaves);
        generateLeaveReport(leaves);
      } else if (reportType === "employee") {
        generateEmployeeReport();
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceReport = (attendance) => {
    const employeeAttendance = {};

    employees.forEach((emp) => {
      employeeAttendance[emp._id] = {
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
      };
    });

    attendance.forEach((record) => {
      if (record.employee && employeeAttendance[record.employee._id]) {
        employeeAttendance[record.employee._id].totalDays++;
        if (record.checkInTime) {
          employeeAttendance[record.employee._id].presentDays++;
        } else {
          employeeAttendance[record.employee._id].absentDays++;
        }
      }
    });

    setReportData({
      type: "attendance",
      data: Object.values(employeeAttendance),
    });
  };

  const generateLeaveReport = (leaves) => {
    const leaveStats = employees.map((emp) => {
      const empLeaves = leaves.filter(
        (leave) => leave.employee && leave.employee._id === emp._id
      );

      const approved = empLeaves.filter((l) => l.status === "Approved").length;
      const pending = empLeaves.filter((l) => l.status === "Pending").length;
      const rejected = empLeaves.filter((l) => l.status === "Rejected").length;

      return {
        name: emp.name,
        employeeId: emp.employeeId,
        department: emp.department,
        totalRequests: empLeaves.length,
        approved,
        pending,
        rejected,
      };
    });

    setReportData({
      type: "leave",
      data: leaveStats,
    });
  };

  const generateEmployeeReport = () => {
    const employeeStats = employees.map((emp) => ({
      name: emp.name,
      employeeId: emp.employeeId,
      email: emp.email,
      department: emp.department || "N/A",
      designation: emp.designation || "N/A",
      salary: emp.salary || 0,
      joiningDate: emp.joiningDate
        ? new Date(emp.joiningDate).toLocaleDateString()
        : "N/A",
    }));

    setReportData({
      type: "employee",
      data: employeeStats,
    });
  };

  const downloadReport = () => {
    if (!reportData) {
      alert("Please generate a report first");
      return;
    }

    let csvContent = "";
    let fileName = "";

    if (reportData.type === "attendance") {
      csvContent =
        "Employee Name,Employee ID,Department,Total Days,Present Days,Absent Days,Attendance %\n";
      reportData.data.forEach((row) => {
        const percentage =
          row.totalDays > 0
            ? ((row.presentDays / row.totalDays) * 100).toFixed(2)
            : 0;
        csvContent += `${row.name},${row.employeeId},${
          row.department || "N/A"
        },${row.totalDays},${row.presentDays},${
          row.absentDays
        },${percentage}%\n`;
      });
      fileName = `Attendance_Report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    } else if (reportData.type === "leave") {
      csvContent =
        "Employee Name,Employee ID,Department,Total Requests,Approved,Pending,Rejected\n";
      reportData.data.forEach((row) => {
        csvContent += `${row.name},${row.employeeId},${
          row.department || "N/A"
        },${row.totalRequests},${row.approved},${row.pending},${
          row.rejected
        }\n`;
      });
      fileName = `Leave_Report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    } else if (reportData.type === "employee") {
      csvContent =
        "Employee Name,Employee ID,Email,Department,Designation,Salary,Joining Date\n";
      reportData.data.forEach((row) => {
        csvContent += `${row.name},${row.employeeId},${row.email},${row.department},${row.designation},₹${row.salary},${row.joiningDate}\n`;
      });
      fileName = `Employee_Report_${
        new Date().toISOString().split("T")[0]
      }.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    alert("Report downloaded successfully!");
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            Only admins and HR can access reports.
          </p>
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
                Reports & Analytics
                <span className="text-sm font-normal text-purple-600 ml-2">
                  For Admin/HR Officer
                </span>
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
              <button
                onClick={() => navigate("/payroll")}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
              >
                Payroll
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Information Note */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            📊 Reports & Analytics
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              Generate comprehensive reports for attendance, leave, and employee
              data.
            </p>
            <p>
              All reports can be downloaded as CSV files for further analysis in
              Excel or other tools.
            </p>
          </div>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Generate Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="attendance">Attendance Report</option>
                <option value="leave">Leave Report</option>
                <option value="employee">Employee Report</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
            {reportData && (
              <button
                onClick={downloadReport}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                📥 Download CSV
              </button>
            )}
          </div>
        </div>

        {/* Report Display */}
        {reportData && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 bg-gray-50 border-b">
              <h3 className="text-lg font-bold">
                {reportData.type === "attendance" && "Attendance Report"}
                {reportData.type === "leave" && "Leave Report"}
                {reportData.type === "employee" && "Employee Report"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {reportData.type !== "employee" &&
                  `Period: ${dateRange.startDate} to ${dateRange.endDate}`}
                {reportData.type === "employee" &&
                  `Total Employees: ${reportData.data.length}`}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {reportData.type === "attendance" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Employee Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Days
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Present
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Attendance %
                        </th>
                      </>
                    )}
                    {reportData.type === "leave" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Employee Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Requests
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Approved
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pending
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rejected
                        </th>
                      </>
                    )}
                    {reportData.type === "employee" && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Employee ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Designation
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Joining Date
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {reportData.type === "attendance" && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.employeeId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.department || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.totalDays}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                            {row.presentDays}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                            {row.absentDays}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {row.totalDays > 0
                              ? (
                                  (row.presentDays / row.totalDays) *
                                  100
                                ).toFixed(2)
                              : 0}
                            %
                          </td>
                        </>
                      )}
                      {reportData.type === "leave" && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.employeeId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.department || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.totalRequests}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                            {row.approved}
                          </td>
                          <td className="px-6 py-4 text-sm text-yellow-600 font-semibold">
                            {row.pending}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                            {row.rejected}
                          </td>
                        </>
                      )}
                      {reportData.type === "employee" && (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.employeeId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.department}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.designation}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                            ₹{row.salary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {row.joiningDate}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
