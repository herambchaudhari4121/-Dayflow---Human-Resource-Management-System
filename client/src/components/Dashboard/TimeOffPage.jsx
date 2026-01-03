import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const TimeOffPage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const isAdmin = currentUser.role === "admin" || currentUser.role === "hr";

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewLeaveModal, setShowNewLeaveModal] = useState(false);
  const [statistics, setStatistics] = useState({
    paidTimeOffAvailable: 24,
    paidTimeOffUsed: 0,
    sickTimeOffAvailable: 7,
    sickTimeOffUsed: 0,
  });

  const [newLeave, setNewLeave] = useState({
    startDate: "",
    endDate: "",
    leaveType: "Paid Time Off",
    reason: "",
    attachment: null,
  });

  const [allocationDays, setAllocationDays] = useState(1);

  // Fetch leaves
  const fetchLeaves = async () => {
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
        response = await axios.get(
          "http://localhost:5000/api/leaves/all",
          config
        );
      } else {
        response = await axios.get(
          "http://localhost:5000/api/leaves/my-leaves",
          config
        );
        console.log("Employee leaves response:", response.data);
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        }
      }

      setLeaves(response.data.leaves || []);
      console.log("Leaves set:", response.data.leaves);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      console.error("Error response:", error.response);
      alert(error.response?.data?.message || "Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeave({
      ...newLeave,
      [name]: value,
    });

    // Calculate allocation days when dates change
    if (name === "startDate" || name === "endDate") {
      const start =
        name === "startDate" ? new Date(value) : new Date(newLeave.startDate);
      const end =
        name === "endDate" ? new Date(value) : new Date(newLeave.endDate);

      if (start && end && end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setAllocationDays(diffDays);
      }
    }
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setNewLeave({
      ...newLeave,
      attachment: e.target.files[0],
    });
  };

  // Submit new leave request
  const handleSubmitLeave = async (e) => {
    e.preventDefault();

    if (!newLeave.startDate || !newLeave.endDate) {
      alert("Please select start date and end date");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post("http://localhost:5000/api/leaves", newLeave, config);

      alert("Leave request submitted successfully!");
      setShowNewLeaveModal(false);
      setNewLeave({
        startDate: "",
        endDate: "",
        leaveType: "Paid Time Off",
        reason: "",
        attachment: null,
      });
      setAllocationDays(1);
      fetchLeaves();
    } catch (error) {
      console.error("Error submitting leave:", error);
      alert(error.response?.data?.message || "Failed to submit leave request");
    }
  };

  // Approve leave
  const handleApprove = async (leaveId) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `http://localhost:5000/api/leaves/${leaveId}/approve`,
        {},
        config
      );

      alert("Leave approved successfully!");
      fetchLeaves();
    } catch (error) {
      console.error("Error approving leave:", error);
      alert(error.response?.data?.message || "Failed to approve leave");
    }
  };

  // Reject leave
  const handleReject = async (leaveId) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(
        `http://localhost:5000/api/leaves/${leaveId}/reject`,
        { reason },
        config
      );

      alert("Leave rejected");
      fetchLeaves();
    } catch (error) {
      console.error("Error rejecting leave:", error);
      alert(error.response?.data?.message || "Failed to reject leave");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "✓ Approved";
      case "rejected":
        return "✗ Rejected";
      case "pending":
        return "⏳ Pending";
      default:
        return status;
    }
  };

  // Filter leaves
  const filteredLeaves = leaves.filter((leave) => {
    const employeeName = leave.employee?.name?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return employeeName.includes(query);
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
                Time Off
                {isAdmin && (
                  <span className="text-sm font-normal text-purple-600 ml-2">
                    For Admin & HR Officer
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
                onClick={() => navigate("/attendance")}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
              >
                Attendance
              </button>
              {!isAdmin && (
                <button
                  onClick={() => setShowNewLeaveModal(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-semibold"
                >
                  + Request Time Off
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {/* Controls Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* NEW badge and Time Off label */}
            <div className="flex items-center gap-2">
              {!isAdmin && (
                <span className="px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded">
                  NEW
                </span>
              )}
              <label className="text-gray-700 font-medium">Time Off</label>
            </div>

            {/* Allocation button for employees */}
            {!isAdmin && (
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Allocation
              </button>
            )}

            {/* Search bar */}
            {isAdmin && (
              <input
                type="text"
                placeholder="Searchbar"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            )}
          </div>

          {/* Statistics for employees */}
          {!isAdmin && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-gray-600">Paid time Off</p>
                  <p className="text-xl font-bold text-blue-600">
                    {statistics.paidTimeOffAvailable} Days Available
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sick time off</p>
                  <p className="text-xl font-bold text-green-600">
                    {statistics.sickTimeOffAvailable} Days Available
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Note Box */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg">
          <h3 className="text-lg font-bold text-yellow-900 mb-3">📋 Note</h3>
          <p className="text-sm text-yellow-800">
            Employees can view only their own time off records, while Admins and
            HR Officers can view time off records & approve/reject them for all
            employees
          </p>
        </div>

        {/* Action Buttons */}
        {!isAdmin && (
          <div className="mb-6">
            <button
              onClick={() => setShowNewLeaveModal(true)}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-md font-semibold"
            >
              + Request Time Off
            </button>
          </div>
        )}

        {/* Leaves Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-600">Loading time off requests...</p>
            </div>
          ) : filteredLeaves.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-lg">
                No time off requests found
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time off Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {isAdmin
                            ? leave.employee?.name || "Unknown"
                            : `[Emp Name: ${currentUser.name}]`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(leave.startDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(leave.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {leave.leaveType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            leave.status
                          )}`}
                        >
                          {getStatusText(leave.status)}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {leave.status === "pending" ? (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleReject(leave._id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1"
                                title="Reject"
                              >
                                ✗ Reject
                              </button>
                              <button
                                onClick={() => handleApprove(leave._id)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1"
                                title="Approve"
                              >
                                ✓ Approve
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                                leave.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {leave.status === "approved"
                                ? "✓ Approved"
                                : "✗ Rejected"}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* New Leave Modal */}
      {showNewLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            {/* Close button */}
            <button
              onClick={() => setShowNewLeaveModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>

            <h2 className="text-xl font-bold mb-6">Time off Type Request</h2>

            <form onSubmit={handleSubmitLeave}>
              <div className="space-y-4">
                {/* Employee Name (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-blue-600">
                    [{currentUser.name}]
                  </div>
                </div>

                {/* Time off Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time off Type
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-blue-600">
                    [{newLeave.leaveType}]
                  </div>
                  <div className="mt-2 p-2 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-600 mb-2">TimeOff Types:</p>
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="leaveType"
                          value="Paid Time Off"
                          checked={newLeave.leaveType === "Paid Time Off"}
                          onChange={handleInputChange}
                          className="text-purple-600"
                        />
                        <span className="text-sm">- Paid Time off</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="leaveType"
                          value="Sick Time Off"
                          checked={newLeave.leaveType === "Sick Time Off"}
                          onChange={handleInputChange}
                          className="text-purple-600"
                        />
                        <span className="text-sm">- Sick Leave</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="leaveType"
                          value="Unpaid Leave"
                          checked={newLeave.leaveType === "Unpaid Leave"}
                          onChange={handleInputChange}
                          className="text-purple-600"
                        />
                        <span className="text-sm">- Unpaid Leaves</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Validity Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validity Period
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      name="startDate"
                      value={newLeave.startDate}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-600"
                      required
                    />
                    <span className="text-gray-600">To</span>
                    <input
                      type="date"
                      name="endDate"
                      value={newLeave.endDate}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-600"
                      required
                    />
                  </div>
                </div>

                {/* Allocation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allocation
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={allocationDays.toString().padStart(2, "0") + ".00"}
                      readOnly
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-blue-600"
                    />
                    <span className="text-gray-600">Days</span>
                  </div>
                </div>

                {/* Attachment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment:
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="px-4 py-2 bg-purple-500 text-white rounded cursor-pointer hover:bg-purple-600 text-sm">
                      Submit
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </label>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                    >
                      Discard
                    </button>
                    {newLeave.attachment && (
                      <span className="text-sm text-gray-600">
                        📎 {newLeave.attachment.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-2">
                      (For sick leave certificate)
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-md font-semibold"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeOffPage;
