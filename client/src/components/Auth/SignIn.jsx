import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signin",
        formData
      );

      // Store token and user data
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect based on role
      if (
        response.data.user.role === "admin" ||
        response.data.user.role === "hr"
      ) {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-200 px-8 py-4 rounded-md">
            <span className="text-gray-600 font-semibold">App/Web Logo</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Sign in Page
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Login Id/Email :-
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

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password :-
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn-primary mt-6" disabled={loading}>
            {loading ? "Signing in..." : "SIGN IN"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <span className="text-gray-600">Don't have an Account? </span>
          <Link to="/signup" className="btn-secondary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
