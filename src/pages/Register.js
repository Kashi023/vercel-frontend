
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
    setSuccess("");
  };

  // Validate registration form
  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (formData.name.trim().length < 2) {
      return "Name must contain at least 2 characters.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match.";
    }

    if (
      formData.age !== "" &&
      (
        !Number.isFinite(Number(formData.age)) ||
        Number(formData.age) < 1 ||
        Number(formData.age) > 120
      )
    ) {
      return "Please enter a valid age between 1 and 120.";
    }

    if (!formData.gender) {
      return "Please select your gender.";
    }

    return "";
  };

  // Handle patient registration
  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const patientData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender
      };

      // Call patient registration API
      const response = await axios.post(
        `${API_URL}/api/auth/register`,
        patientData,
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );

      if (!response.data.success) {
        setError(
          response.data.message || "Registration failed."
        );
        return;
      }

      setSuccess(
        response.data.message ||
        "Registration successful! Please login."
      );

      // Redirect to login after successful registration
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { role: "user" }
        });
      }, 1500);

    } catch (err) {
      console.error(
        "Patient registration error:",
        err.response?.data || err.message || err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
          "Registration failed. Please try again."
        );
      } else if (err.request) {
        setError(
          "Cannot connect to server. Please check whether your backend is running."
        );
      } else {
        setError(
          err.message || "Something went wrong."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      {/* Left Section */}
      <div className="register-left">

        <div className="register-brand">
          <div className="register-brand-icon">✚</div>
          <span>HealthAI</span>
        </div>

        <div className="register-welcome">

          <span className="register-tag">
            SMARTER HEALTHCARE
          </span>

          <h1>
            Begin Your
            <br />
            <span>Health Journey.</span>
          </h1>

          <p>
            Create your HealthAI account and experience
            smarter healthcare with AI-powered symptom
            analysis, medical image insights, and access
            to healthcare professionals.
          </p>

          <div className="register-features">
            <div>✓ Personalized health dashboard</div>
            <div>✓ AI-powered symptom analysis</div>
            <div>✓ Medical image insights</div>
            <div>✓ Connect with doctors</div>
          </div>

        </div>

        <div className="register-left-footer">
          © 2026 HealthAI. All rights reserved.
        </div>

      </div>

      {/* Right Section */}
      <div className="register-right">

        <div className="register-card">

          <div className="register-mobile-brand">
            <span>✚</span> HealthAI
          </div>

          {/* Header */}
          <div className="register-heading">

            <span className="register-small-heading">
              CREATE ACCOUNT
            </span>

            <h2>Create Your Account</h2>

            <p>
              Enter your details to get started with HealthAI.
            </p>

          </div>

          <form onSubmit={handleRegister}>

            {/* Error Message */}
            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="register-success" role="status">
                {success}
              </div>
            )}

            {/* Personal Information */}
            <h3>Personal Information</h3>

            <div className="register-form-group">

              <label htmlFor="name">
                Full Name *
              </label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                autoComplete="name"
                required
                disabled={loading}
              />

            </div>

            <div className="register-form-group">

              <label htmlFor="email">
                Email Address *
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
              />

            </div>

            <div className="register-form-row">

              <div className="register-form-group">

                <label htmlFor="age">
                  Age
                </label>

                <input
                  id="age"
                  type="number"
                  name="age"
                  placeholder="Enter age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

              <div className="register-form-group">

                <label htmlFor="gender">
                  Gender *
                </label>

                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>
                    Select gender
                  </option>

                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>

                </select>

              </div>

            </div>

            {/* Security Information */}
            <h3>Account Security</h3>

            <div className="register-form-group">

              <label htmlFor="password">
                Password *
              </label>

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
                autoComplete="new-password"
                required
                disabled={loading}
              />

              <small>
                Password must contain at least 6 characters.
              </small>

            </div>

            <div className="register-form-group">

              <label htmlFor="confirmPassword">
                Confirm Password *
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={6}
                autoComplete="new-password"
                required
                disabled={loading}
              />

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Patient Account"
              }
            </button>

          </form>

          {/* Login Link */}
          <div className="register-login-link">
            Already have an account?{" "}
            <Link to="/login">
              Sign In
            </Link>
          </div>

          {/* Doctor Registration */}
          <div className="register-doctor-link">
            Are you a medical professional?{" "}
            <Link
              to="/doctor/register"
              state={{ role: "doctor" }}
            >
              Register as Doctor
            </Link>
          </div>

          <div className="register-security-note">
            🔒 Your information is protected and secure.
          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;
