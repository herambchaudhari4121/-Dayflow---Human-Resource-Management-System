import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("companyName", formData.companyName);
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone);
      submitData.append("password", formData.password);
      if (logo) {
        submitData.append("logo", logo);
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(
        "Account created successfully! Please check your email for verification."
      );
      navigate("/signin");
    } catch (err) {
      setError(
        err.response?.data?.message || "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-200 px-8 py-4 rounded-md">
            <span className="text-gray-600 font-semibold">App/Web Logo</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Sign Up Page
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Name with Logo Upload */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Company Name :-
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="input-field flex-1"
                placeholder="Enter company name"
                required
              />
              <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
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
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </label>
            </div>
            {logoPreview && (
              <div className="mt-2 flex justify-end">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-12 w-12 object-cover rounded"
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Name :-
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email :-
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Phone :-
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your phone number"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password :-
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Confirm Password :-
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary mt-6" disabled={loading}>
            {loading ? "Signing up..." : "SIGN UP"}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/signin" className="btn-secondary">
            Sign In
          </Link>
        </div>

        {/* Note Section */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h3 className="font-bold text-gray-800 mb-2">Note</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • Normal user cannot register, so when the HR officer or Admin
              creates a new user/employee, there ID should also created with
              this method.
            </li>
            <li>
              • There password should be auto generated for the first time by
              the system.
            </li>
            <li>• They can login and change the system generated password.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
