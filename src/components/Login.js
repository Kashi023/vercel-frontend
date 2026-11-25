
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import "./Login.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(
    location.state?.role === "doctor" ? "doctor" : "user"
  );

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
  };

  // Handle role selection
  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError("");
  };

  // Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const endpoint =
        role === "doctor"
          ? "/api/doctors/login"
          : "/api/auth/login";

      const response = await axios.post(
        `${API_URL}${endpoint}`,
        {
          email,
          password
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      const data = response.data;

      if (!data.success || !data.token) {
        setError(data.message || "Invalid login response.");
        return;
      }

      const returnedRole = String(
        data.user?.role || data.role || ""
      ).toLowerCase();

      if (!returnedRole) {
        setError("User role was not returned by the server.");
        return;
      }

      if (returnedRole !== role) {
        setError("Please select the correct account type.");
        return;
      }

      // Save authentication details
      const loggedInUser = {
        ...(data.user || {}),
        role: returnedRole
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", returnedRole);
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      console.log("Login successful:", loggedInUser);

      // Redirect according to role
      if (returnedRole === "doctor") {
        navigate("/doctor/dashboard", {
          replace: true
        });
      } else {
        navigate("/dashboard", {
          replace: true
        });
      }

    } catch (err) {
      console.error(
        "Login error:",
        err.response?.data || err.message || err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Login failed. Please check your credentials."
        );
      } else if (err.request) {
        setError(
          "Cannot connect to the server. Please check whether your backend is running."
        );
      } else {
        setError(err.message || "Something went wrong.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Left Section */}
      <div className="login-left">

        <div className="brand">
          <div className="brand-icon">✚</div>
          <span>HealthAI</span>
        </div>

        <div className="welcome-content">

          <span className="welcome-tag">
            SMARTER HEALTHCARE
          </span>

          <h1>
            Your Health,
            <br />
            <span>Powered by AI.</span>
          </h1>

          <p>
            A smarter way to understand your health.
            Explore AI-powered symptom analysis, medical
            image insights, and healthcare services.
          </p>

          <div className="feature-list">
            <div>✓ AI-powered symptom analysis</div>
            <div>✓ Medical image analysis</div>
            <div>✓ Connect with healthcare professionals</div>
          </div>

        </div>

        <div className="left-footer">
          © 2026 HealthAI. All rights reserved.
        </div>

      </div>

      {/* Right Section */}
      <div className="login-right">

        <div className="login-card">

          <div className="mobile-brand">
            <span className="brand-icon">✚</span>
            <span>HealthAI</span>
          </div>

          <div className="login-heading">

            <span className="small-heading">
              WELCOME BACK
            </span>

            <h2>Sign in to HealthAI</h2>

            <p>
              Please enter your account details to continue.
            </p>

          </div>

          {/* Role Selection */}
          <div className="role-selector">

            <button
              type="button"
              className={
                role === "user"
                  ? "role-option active"
                  : "role-option"
              }
              onClick={() => handleRoleChange("user")}
              disabled={loading}
            >
              <span className="role-icon">👤</span>

              <span>
                <strong>User</strong>
                <small>Patient account</small>
              </span>
            </button>

            <button
              type="button"
              className={
                role === "doctor"
                  ? "role-option active"
                  : "role-option"
              }
              onClick={() => handleRoleChange("doctor")}
              disabled={loading}
            >
              <span className="role-icon">⚕</span>

              <span>
                <strong>Doctor</strong>
                <small>Medical professional</small>
              </span>
            </button>

          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />

            </div>

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
              />

            </div>

            <div className="forgot-password">
              <Link to="/forgot-password">
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : `Continue as ${role === "user" ? "User" : "Doctor"}`
              }
            </button>

          </form>

          {/* Patient Registration */}
          <div className="login-bottom">
            Don't have an account?{" "}
            <Link to="/register">
              Create account
            </Link>
          </div>

          {/* Doctor Registration */}
          <div className="login-bottom">
            Are you a doctor?{" "}
            <Link to="/doctor/register">
              Register as Doctor
            </Link>
          </div>

          <div className="security-note">
            <span>🔒</span>
            Your information is protected and secure.
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
