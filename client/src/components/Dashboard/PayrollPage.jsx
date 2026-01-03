import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PayrollPage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser.role === "admin" || currentUser.role === "hr";

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollData, setPayrollData] = useState({
    baseSalary: "",
    bonus: 0,
    deductions: 0,
    workingDays: 0,
    presentDays: 0,
  });

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.employees || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      alert("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = (employee) => {
    setSelectedEmployee(employee);
    setPayrollData({
      baseSalary: employee.salary || "",
      bonus: 0,
      deductions: 0,
      workingDays: 22,
      presentDays: 22,
    });
    setShowPayrollModal(true);
  };

  const calculateNetSalary = () => {
    const base = parseFloat(payrollData.baseSalary) || 0;
    const bonus = parseFloat(payrollData.bonus) || 0;
    const deductions = parseFloat(payrollData.deductions) || 0;
    const workingDays = parseInt(payrollData.workingDays) || 1;
    const presentDays = parseInt(payrollData.presentDays) || 0;

    const perDaySalary = base / workingDays;
    const earnedSalary = perDaySalary * presentDays;
    const netSalary = earnedSalary + bonus - deductions;

    return {
      earnedSalary: earnedSalary.toFixed(2),
      netSalary: netSalary.toFixed(2),
    };
  };

  const handleDownloadPayslip = () => {
    const { earnedSalary, netSalary } = calculateNetSalary();

    // Create HTML content for the payslip
    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payslip - ${selectedEmployee.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .payslip {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4F46E5;
          }
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #4F46E5;
            margin-bottom: 5px;
          }
          .payslip-title {
            font-size: 20px;
            color: #666;
            margin-top: 10px;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-block {
            flex: 1;
          }
          .info-label {
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .info-value {
            color: #666;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
          }
          .amount {
            text-align: right;
            font-family: monospace;
          }
          .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
            font-size: 16px;
          }
          .net-salary {
            background-color: #4F46E5;
            color: white;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 1px solid #333;
            width: 200px;
            margin: 40px auto 10px;
          }
          @media print {
            body {
              margin: 0;
              padding: 20px;
              background-color: white;
            }
            .payslip {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="payslip">
          <div class="header">
            <div class="company-name">DayFlow HRMS</div>
            <div class="payslip-title">SALARY SLIP</div>
            <div style="color: #666; margin-top: 10px;">${
              monthNames[selectedMonth]
            } ${selectedYear}</div>
          </div>

          <div class="info-section">
            <div class="info-block">
              <div class="info-label">Employee Name:</div>
              <div class="info-value">${selectedEmployee.name}</div>
              
              <div class="info-label">Employee ID:</div>
              <div class="info-value">${selectedEmployee.employeeId}</div>
              
              <div class="info-label">Department:</div>
              <div class="info-value">${
                selectedEmployee.department || "N/A"
              }</div>
            </div>
            
            <div class="info-block" style="text-align: right;">
              <div class="info-label">Email:</div>
              <div class="info-value">${selectedEmployee.email}</div>
              
              <div class="info-label">Pay Period:</div>
              <div class="info-value">${
                monthNames[selectedMonth]
              } ${selectedYear}</div>
              
              <div class="info-label">Generated On:</div>
              <div class="info-value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th class="amount">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>EARNINGS</strong></td>
                <td></td>
              </tr>
              <tr>
                <td>Base Salary (${payrollData.presentDays}/${
      payrollData.workingDays
    } days)</td>
                <td class="amount">${parseFloat(earnedSalary).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</td>
              </tr>
              ${
                parseFloat(payrollData.bonus) > 0
                  ? `
              <tr>
                <td>Bonus / Incentives</td>
                <td class="amount" style="color: green;">+${parseFloat(
                  payrollData.bonus
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
              </tr>
              `
                  : ""
              }
              <tr class="total-row">
                <td>GROSS EARNINGS</td>
                <td class="amount">₹${(
                  parseFloat(earnedSalary) + parseFloat(payrollData.bonus)
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
              </tr>
              
              ${
                parseFloat(payrollData.deductions) > 0
                  ? `
              <tr>
                <td><strong>DEDUCTIONS</strong></td>
                <td></td>
              </tr>
              <tr>
                <td>Tax / Other Deductions</td>
                <td class="amount" style="color: red;">-${parseFloat(
                  payrollData.deductions
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL DEDUCTIONS</td>
                <td class="amount">₹${parseFloat(
                  payrollData.deductions
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</td>
              </tr>
              `
                  : ""
              }
              
              <tr class="total-row net-salary">
                <td><strong>NET SALARY</strong></td>
                <td class="amount"><strong>₹${parseFloat(
                  netSalary
                ).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</strong></td>
              </tr>
            </tbody>
          </table>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <strong>Note:</strong> This is a computer-generated payslip and does not require a signature.
          </div>

          <div class="signature-section">
            <div class="signature">
              <div class="signature-line"></div>
              <div>Employee Signature</div>
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div>Authorized Signatory</div>
            </div>
          </div>

          <div class="footer">
            <p>DayFlow HRMS - Human Resource Management System</p>
            <p>This is a confidential document. Please keep it secure.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create a blob and download
    const blob = new Blob([payslipHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Payslip_${selectedEmployee.name.replace(/\s+/g, "_")}_${
      monthNames[selectedMonth]
    }_${selectedYear}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Open in new window for printing
    const printWindow = window.open("", "_blank");
    printWindow.document.write(payslipHTML);
    printWindow.document.close();

    alert(
      `Payslip generated successfully!\nDownloaded as HTML file. You can open it and print as PDF.`
    );
    setShowPayrollModal(false);
  };

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.employeeId.toLowerCase().includes(query)
    );
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            Only admins and HR can access payroll.
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
                Payroll Management
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
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Information Note */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            💰 Payroll Information
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              Generate monthly payslips for employees based on their attendance
              and leave records.
            </p>
            <p>
              The system calculates salary based on working days, present days,
              bonuses, and deductions.
            </p>
            <p className="mt-2 text-blue-900 font-semibold">
              Payslips include: Base Salary, Bonuses, Deductions, Present Days,
              and Net Salary
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Month/Year Selector */}
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[2024, 2025, 2026, 2027].map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by name or employee ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-600">Loading employees...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">No employees found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                            {employee.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.employeeId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {employee.department || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          ₹{employee.salary?.toLocaleString() || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleGeneratePayslip(employee)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                        >
                          Generate Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payroll Modal */}
      {showPayrollModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              Generate Payslip - {selectedEmployee.name}
            </h2>
            <p className="text-gray-600 mb-6">
              {monthNames[selectedMonth]} {selectedYear}
            </p>

            <div className="space-y-4">
              {/* Base Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Salary (₹)
                </label>
                <input
                  type="number"
                  value={payrollData.baseSalary}
                  onChange={(e) =>
                    setPayrollData({
                      ...payrollData,
                      baseSalary: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Working Days */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Working Days
                  </label>
                  <input
                    type="number"
                    value={payrollData.workingDays}
                    onChange={(e) =>
                      setPayrollData({
                        ...payrollData,
                        workingDays: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Present Days
                  </label>
                  <input
                    type="number"
                    value={payrollData.presentDays}
                    onChange={(e) =>
                      setPayrollData({
                        ...payrollData,
                        presentDays: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Bonus and Deductions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bonus (₹)
                  </label>
                  <input
                    type="number"
                    value={payrollData.bonus}
                    onChange={(e) =>
                      setPayrollData({ ...payrollData, bonus: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deductions (₹)
                  </label>
                  <input
                    type="number"
                    value={payrollData.deductions}
                    onChange={(e) =>
                      setPayrollData({
                        ...payrollData,
                        deductions: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <h3 className="font-semibold text-lg mb-3">Salary Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Earned Salary:</span>
                    <span className="font-semibold">
                      ₹{calculateNetSalary().earnedSalary}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus:</span>
                    <span className="font-semibold text-green-600">
                      +₹{payrollData.bonus}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deductions:</span>
                    <span className="font-semibold text-red-600">
                      -₹{payrollData.deductions}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Net Salary:</span>
                      <span className="text-blue-600">
                        ₹{calculateNetSalary().netSalary}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowPayrollModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadPayslip}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Download Payslip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
