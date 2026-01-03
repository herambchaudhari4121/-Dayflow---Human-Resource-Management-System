import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const isAdmin = currentUser.role === "admin" || currentUser.role === "hr";
  const isOwnProfile = !id || id === currentUser.id;

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    address: "",
    dateOfBirth: "",
    joiningDate: "",
    // Enhanced salary info
    wageType: "fixed",
    monthlyWage: "",
    yearlyWage: "",
    salaryComponents: [],
  });

  useEffect(() => {
    fetchEmployeeData();
  }, [id]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const targetId = id || currentUser.id;
      const response = await axios.get(
        `http://localhost:5000/api/employees/${targetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const emp = response.data.employee;
      setEmployee(emp);

      // Initialize salary components with default structure if not exists
      const defaultComponents = emp.salaryStructure?.components || [
        {
          name: "Basic Salary",
          type: "allowance",
          calculationType: "percentage",
          value: 50,
          amount: 0,
        },
        {
          name: "HRA (House Rent Allowance)",
          type: "allowance",
          calculationType: "percentage",
          value: 30,
          amount: 0,
        },
        {
          name: "Medical Allowance",
          type: "allowance",
          calculationType: "percentage",
          value: 10,
          amount: 0,
        },
        {
          name: "Performance Bonus",
          type: "allowance",
          calculationType: "percentage",
          value: 10,
          amount: 0,
        },
        {
          name: "Professional Tax",
          type: "deduction",
          calculationType: "fixed",
          value: 200,
          amount: 200,
        },
      ];

      setFormData({
        name: emp.name || "",
        email: emp.email || "",
        phone: emp.phone || "",
        designation: emp.designation || "",
        department: emp.department || "",
        address: emp.address || "",
        dateOfBirth: emp.dateOfBirth
          ? new Date(emp.dateOfBirth).toISOString().split("T")[0]
          : "",
        joiningDate: emp.joiningDate
          ? new Date(emp.joiningDate).toISOString().split("T")[0]
          : "",
        wageType: emp.salaryStructure?.wageType || "fixed",
        monthlyWage: emp.salaryStructure?.monthlyWage || "",
        yearlyWage: emp.salaryStructure?.yearlyWage || "",
        salaryComponents: defaultComponents,
      });
    } catch (error) {
      console.error("Error fetching employee:", error);
      alert("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "monthlyWage") {
      // Auto-calculate yearly wage and component amounts
      const monthly = parseFloat(value) || 0;
      const yearly = monthly * 12;

      // Calculate all component amounts based on percentage
      const updatedComponents = formData.salaryComponents.map((comp) => {
        if (comp.calculationType === "percentage") {
          return {
            ...comp,
            amount: (monthly * comp.value) / 100,
          };
        }
        return comp;
      });

      setFormData((prev) => ({
        ...prev,
        monthlyWage: value,
        yearlyWage: yearly.toString(),
        salaryComponents: updatedComponents,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleComponentChange = (index, field, value) => {
    const updatedComponents = [...formData.salaryComponents];
    updatedComponents[index][field] = value;

    // Recalculate amount if value or type changed
    if (field === "value" || field === "calculationType") {
      const comp = updatedComponents[index];
      const monthlyWage = parseFloat(formData.monthlyWage) || 0;

      if (comp.calculationType === "percentage") {
        comp.amount = (monthlyWage * parseFloat(value)) / 100;
      } else {
        comp.amount = parseFloat(value) || 0;
      }
    }

    setFormData((prev) => ({
      ...prev,
      salaryComponents: updatedComponents,
    }));
  };

  const addSalaryComponent = () => {
    setFormData((prev) => ({
      ...prev,
      salaryComponents: [
        ...prev.salaryComponents,
        {
          name: "New Component",
          type: "allowance",
          calculationType: "percentage",
          value: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeSalaryComponent = (index) => {
    setFormData((prev) => ({
      ...prev,
      salaryComponents: prev.salaryComponents.filter((_, i) => i !== index),
    }));
  };

  const calculateTotalSalary = () => {
    const allowances = formData.salaryComponents
      .filter((c) => c.type === "allowance")
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    const deductions = formData.salaryComponents
      .filter((c) => c.type === "deduction")
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

    return allowances - deductions;
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const targetId = id || currentUser.id;

      const updateData = {
        name: formData.name,
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
      };

      // Only admin can update salary
      if (isAdmin) {
        updateData.salaryStructure = {
          wageType: formData.wageType,
          monthlyWage: parseFloat(formData.monthlyWage) || 0,
          yearlyWage: parseFloat(formData.yearlyWage) || 0,
          components: formData.salaryComponents,
          // Keep legacy fields for backward compatibility
          basicSalary: parseFloat(formData.monthlyWage) || 0,
          allowances: formData.salaryComponents
            .filter((c) => c.type === "allowance")
            .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
          deductions: formData.salaryComponents
            .filter((c) => c.type === "deduction")
            .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
        };
      }

      await axios.put(
        `http://localhost:5000/api/employees/${targetId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Profile updated successfully!");
      setIsEditing(false);
      fetchEmployeeData();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Employee Not Found
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600"
          >
            Go Back
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
                Employee Profile
              </h1>
            </div>
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
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                >
                  <span>✏️</span> Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchEmployeeData();
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                      📷
                    </button>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-800 text-center">
                  {employee.name}
                </h2>
                <p className="text-gray-600">{employee.employeeId}</p>
                <p className="text-sm text-gray-500">{employee.role}</p>
              </div>

              {/* Quick Info */}
              <div className="border-t pt-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">
                    {employee.phone || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium text-gray-800">
                    {employee.department || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joining Date</p>
                  <p className="font-medium text-gray-800">
                    {new Date(employee.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes - Admin Only */}
            {isAdmin && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                  <span>💡</span> Important - Salary Setup Guide
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="font-semibold text-blue-800 mb-2">
                      ✅ How the System Works:
                    </p>
                    <ul className="list-disc list-inside text-blue-700 space-y-1 text-xs">
                      <li>
                        Set the <strong>Monthly Wage</strong> first (base
                        salary)
                      </li>
                      <li>
                        Add <strong>Allowances</strong> (HRA, Medical, etc.) as
                        % or fixed amount
                      </li>
                      <li>
                        Add <strong>Deductions</strong> (Tax, PF, etc.) as % or
                        fixed amount
                      </li>
                      <li>
                        All amounts are{" "}
                        <strong>automatically calculated</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="font-semibold text-green-800 mb-2">
                      💰 Example Calculation:
                    </p>
                    <div className="text-xs text-green-700 space-y-1">
                      <p>
                        <strong>Monthly Wage:</strong> ₹50,000
                      </p>
                      <p>
                        <strong>Basic (50%):</strong> ₹50,000 × 50% = ₹25,000
                      </p>
                      <p>
                        <strong>HRA (30%):</strong> ₹50,000 × 30% = ₹15,000
                      </p>
                      <p>
                        <strong>Medical (10%):</strong> ₹50,000 × 10% = ₹5,000
                      </p>
                      <p>
                        <strong>Bonus (10%):</strong> ₹50,000 × 10% = ₹5,000
                      </p>
                      <p className="text-red-700">
                        <strong>Professional Tax:</strong> -₹200 (fixed)
                      </p>
                      <p className="font-bold text-green-900 pt-1 border-t border-green-300">
                        Net Salary: ₹49,800
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-md">
                    <p className="font-semibold text-purple-800 mb-2">
                      ⚙️ Wage Types:
                    </p>
                    <ul className="text-xs text-purple-700 space-y-1">
                      <li>
                        <strong>Fixed Wage:</strong> Monthly/yearly salary
                        (default for salaried employees)
                      </li>
                      <li>
                        <strong>Hourly Wage:</strong> Paid per hour worked (for
                        contract/part-time workers)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-orange-50 p-3 rounded-md">
                    <p className="font-semibold text-orange-800 mb-2">
                      📋 Common Salary Components:
                    </p>
                    <div className="text-xs text-orange-700">
                      <p className="font-medium mb-1">Allowances (+):</p>
                      <p className="ml-4">• Basic Salary (40-60%)</p>
                      <p className="ml-4">• HRA - House Rent (20-30%)</p>
                      <p className="ml-4">• Medical Allowance (5-10%)</p>
                      <p className="ml-4">• Transport/Conveyance (5-10%)</p>
                      <p className="ml-4">• Performance Bonus (10-20%)</p>

                      <p className="font-medium mb-1 mt-2">Deductions (-):</p>
                      <p className="ml-4">• Professional Tax (fixed ₹200)</p>
                      <p className="ml-4">• Provident Fund - PF (12%)</p>
                      <p className="ml-4">• Income Tax (as per slab)</p>
                      <p className="ml-4">• ESI - Employee Insurance (1.75%)</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <p className="font-semibold text-yellow-800 mb-1">
                      ⚠️ Remember:
                    </p>
                    <ul className="list-disc list-inside text-yellow-700 text-xs space-y-1">
                      <li>
                        Total % should not exceed 100% for percentage-based
                        components
                      </li>
                      <li>Changes take effect immediately upon saving</li>
                      <li>Yearly salary = Monthly salary × 12</li>
                      <li>Edit mode required to modify salary structure</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Tabs Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-t-lg shadow-md">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex-1 px-6 py-4 font-medium ${
                    activeTab === "profile"
                      ? "border-b-2 border-purple-500 text-purple-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Profile Info
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("salary")}
                    className={`flex-1 px-6 py-4 font-medium ${
                      activeTab === "salary"
                        ? "border-b-2 border-purple-500 text-purple-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Salary Info
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("attendance")}
                  className={`flex-1 px-6 py-4 font-medium ${
                    activeTab === "attendance"
                      ? "border-b-2 border-purple-500 text-purple-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setActiveTab("timeoff")}
                  className={`flex-1 px-6 py-4 font-medium ${
                    activeTab === "timeoff"
                      ? "border-b-2 border-purple-500 text-purple-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Time Off
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-lg shadow-md p-6">
              {/* Profile Info Tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-50 rounded-md">
                          {employee.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Login ID
                      </label>
                      <p className="px-4 py-2 bg-gray-50 rounded-md">
                        {employee.employeeId}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="px-4 py-2 bg-gray-50 rounded-md">
                        {employee.email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-50 rounded-md">
                          {employee.phone || "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Designation
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="designation"
                          value={formData.designation}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-50 rounded-md">
                          {employee.designation || "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-50 rounded-md">
                          {employee.department || "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-50 rounded-md">
                          {employee.dateOfBirth
                            ? new Date(
                                employee.dateOfBirth
                              ).toLocaleDateString()
                            : "Not set"}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Joining Date
                      </label>
                      <p className="px-4 py-2 bg-gray-50 rounded-md">
                        {new Date(employee.joiningDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-50 rounded-md">
                          {employee.address || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* About Section */}
                  <div className="mt-8">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      About
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {employee.about || "No information provided yet."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Salary Info Tab - Admin Only */}
              {activeTab === "salary" && isAdmin && (
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>Admin Only:</strong> Salary information is only
                      visible to Admin/HR officers. Define and manage all
                      salary-related components with automatic calculations.
                    </p>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Salary Structure Configuration
                  </h3>

                  {/* Wage Type Selection */}
                  <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wage Type
                    </label>
                    <select
                      name="wageType"
                      value={formData.wageType}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                    >
                      <option value="fixed">Fixed Wage</option>
                      <option value="hourly">Hourly Wage</option>
                    </select>
                    <p className="text-xs text-gray-600 mt-1">
                      Fixed wage: Monthly/yearly salary | Hourly wage: Paid per
                      hour worked
                    </p>
                  </div>

                  {/* Monthly and Yearly Wage */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Wage (₹)
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="monthlyWage"
                          value={formData.monthlyWage}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="50000"
                        />
                      ) : (
                        <p className="px-4 py-2 bg-gray-50 rounded-md font-semibold text-lg">
                          ₹
                          {parseFloat(
                            formData.monthlyWage || 0
                          ).toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Base monthly wage before components
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yearly Wage (₹)
                      </label>
                      <p className="px-4 py-2 bg-gray-50 rounded-md font-semibold text-lg">
                        ₹
                        {(
                          parseFloat(formData.monthlyWage || 0) * 12
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Automatically calculated (Monthly × 12)
                      </p>
                    </div>
                  </div>

                  {/* Salary Components */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        Salary Components
                      </h4>
                      {isEditing && (
                        <button
                          onClick={addSalaryComponent}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                        >
                          <span>+</span> Add Component
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                      Define allowances and deductions with percentage or fixed
                      amounts. All calculations are automatic based on the
                      monthly wage.
                    </p>

                    {formData.salaryComponents.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 mb-2">
                          No salary components added yet
                        </p>
                        {isEditing && (
                          <p className="text-sm text-gray-400">
                            Click "Add Component" to add allowances or
                            deductions
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.salaryComponents.map((component, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-md border-2 ${
                              component.type === "allowance"
                                ? "bg-green-50 border-green-200"
                                : "bg-red-50 border-red-200"
                            }`}
                          >
                            {isEditing ? (
                              // EDIT MODE: Full detailed form
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                                {/* Component Name */}
                                <div className="md:col-span-3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Component Name
                                  </label>
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={component.name}
                                      onChange={(e) =>
                                        handleComponentChange(
                                          index,
                                          "name",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                  ) : (
                                    <p className="px-3 py-2 bg-white rounded-md text-sm font-medium">
                                      {component.name}
                                    </p>
                                  )}
                                </div>

                                {/* Type */}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Type
                                  </label>
                                  {isEditing ? (
                                    <select
                                      value={component.type}
                                      onChange={(e) =>
                                        handleComponentChange(
                                          index,
                                          "type",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                      <option value="allowance">
                                        Allowance
                                      </option>
                                      <option value="deduction">
                                        Deduction
                                      </option>
                                    </select>
                                  ) : (
                                    <p
                                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        component.type === "allowance"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {component.type === "allowance"
                                        ? "+ Allowance"
                                        : "- Deduction"}
                                    </p>
                                  )}
                                </div>

                                {/* Calculation Type */}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Calculation
                                  </label>
                                  {isEditing ? (
                                    <select
                                      value={component.calculationType}
                                      onChange={(e) =>
                                        handleComponentChange(
                                          index,
                                          "calculationType",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                      <option value="percentage">
                                        % of Wage
                                      </option>
                                      <option value="fixed">
                                        Fixed Amount
                                      </option>
                                    </select>
                                  ) : (
                                    <p className="px-3 py-2 bg-white rounded-md text-sm">
                                      {component.calculationType ===
                                      "percentage"
                                        ? "% of Wage"
                                        : "Fixed"}
                                    </p>
                                  )}
                                </div>

                                {/* Value */}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    {component.calculationType === "percentage"
                                      ? "Percentage (%)"
                                      : "Amount (₹)"}
                                  </label>
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={component.value}
                                      onChange={(e) =>
                                        handleComponentChange(
                                          index,
                                          "value",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      placeholder={
                                        component.calculationType ===
                                        "percentage"
                                          ? "10"
                                          : "5000"
                                      }
                                    />
                                  ) : (
                                    <p className="px-3 py-2 bg-white rounded-md text-sm font-semibold">
                                      {component.calculationType ===
                                      "percentage"
                                        ? `${component.value}%`
                                        : `₹${component.value}`}
                                    </p>
                                  )}
                                </div>

                                {/* Calculated Amount */}
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Monthly Amount
                                  </label>
                                  <p className="px-3 py-2 bg-purple-100 rounded-md text-sm font-bold text-purple-700">
                                    ₹
                                    {parseFloat(
                                      component.amount || 0
                                    ).toLocaleString()}
                                  </p>
                                </div>

                                {/* Remove Button */}
                                {isEditing && (
                                  <div className="md:col-span-1">
                                    <button
                                      onClick={() =>
                                        removeSalaryComponent(index)
                                      }
                                      className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm"
                                      title="Remove component"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}

                                {/* View Mode: Show component summary in single row */}
                                {!isEditing && (
                                  <div className="md:col-span-12 mt-2 pt-2 border-t border-gray-200">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">
                                        {component.calculationType ===
                                        "percentage"
                                          ? `${
                                              component.value
                                            }% of ₹${parseFloat(
                                              formData.monthlyWage || 0
                                            ).toLocaleString()}`
                                          : `Fixed amount`}
                                      </span>
                                      <span
                                        className={`font-semibold ${
                                          component.type === "allowance"
                                            ? "text-green-600"
                                            : "text-red-600"
                                        }`}
                                      >
                                        {component.type === "allowance"
                                          ? "+"
                                          : "-"}
                                        ₹
                                        {parseFloat(
                                          component.amount || 0
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              // VIEW MODE: Compact summary display
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-gray-800 text-lg">
                                    {component.name}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {component.calculationType === "percentage"
                                      ? `${component.value}% of base wage`
                                      : `Fixed: ₹${parseFloat(
                                          component.value || 0
                                        ).toLocaleString()}`}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-2xl font-bold ${
                                      component.type === "allowance"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {component.type === "allowance" ? "+" : "-"}
                                    ₹
                                    {parseFloat(
                                      component.amount || 0
                                    ).toLocaleString()}
                                  </p>
                                  <p
                                    className={`text-xs mt-1 ${
                                      component.type === "allowance"
                                        ? "text-green-700"
                                        : "text-red-700"
                                    }`}
                                  >
                                    {component.type === "allowance"
                                      ? "Allowance"
                                      : "Deduction"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Total Salary Calculation */}
                  <div className="border-t pt-6 mt-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg shadow-md">
                      <h4 className="text-lg font-bold text-gray-800 mb-4">
                        💰 Salary Summary
                      </h4>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-gray-700 font-medium">
                            Base Monthly Wage:
                          </span>
                          <span className="font-semibold text-blue-600">
                            ₹
                            {parseFloat(
                              formData.monthlyWage || 0
                            ).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-gray-700">
                            Total Allowances:
                          </span>
                          <span className="font-semibold text-green-600">
                            +₹
                            {formData.salaryComponents
                              .filter((c) => c.type === "allowance")
                              .reduce(
                                (sum, c) => sum + (parseFloat(c.amount) || 0),
                                0
                              )
                              .toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-gray-700">
                            Total Deductions:
                          </span>
                          <span className="font-semibold text-red-600">
                            -₹
                            {formData.salaryComponents
                              .filter((c) => c.type === "deduction")
                              .reduce(
                                (sum, c) => sum + (parseFloat(c.amount) || 0),
                                0
                              )
                              .toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center pt-3 bg-white rounded-lg p-4 shadow-sm">
                          <span className="text-xl font-bold text-gray-800">
                            💵 Net Monthly Salary:
                          </span>
                          <span className="text-3xl font-bold text-purple-600">
                            ₹{calculateTotalSalary().toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                          <span className="text-base font-semibold text-gray-700">
                            📅 Net Yearly Salary:
                          </span>
                          <span className="text-2xl font-bold text-purple-600">
                            ₹{(calculateTotalSalary() * 12).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendance Tab */}
              {activeTab === "attendance" && (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Attendance history will be displayed here.
                  </p>
                </div>
              )}

              {/* Time Off Tab */}
              {activeTab === "timeoff" && (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Time off requests will be displayed here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
