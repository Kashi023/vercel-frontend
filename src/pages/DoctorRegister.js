
import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./DoctorRegister.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function DoctorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    qualification: "",
    hospital: "",
    consultationFee: "",
    bio: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setError("");
    setSuccess("");
  };


  // ==========================================
  // VALIDATE FORM
  // ==========================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Please enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (formData.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (!formData.specialization) {
      return "Please select your specialization.";
    }

    if (
      formData.experience === "" ||
      !Number.isFinite(Number(formData.experience)) ||
      Number(formData.experience) < 0
    ) {
      return "Please enter valid years of experience.";
    }

    if (!formData.qualification.trim()) {
      return "Please enter your qualification.";
    }

    if (
      formData.consultationFee === "" ||
      !Number.isFinite(Number(formData.consultationFee)) ||
      Number(formData.consultationFee) < 0
    ) {
      return "Please enter a valid consultation fee.";
    }

    if (formData.bio.trim().length > 1000) {
      return "Professional bio cannot exceed 1000 characters.";
    }

    return "";
  };


  // ==========================================
  // REGISTER DOCTOR
  // ==========================================

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

      const doctorData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        specialization: formData.specialization,
        experience: Number(formData.experience),
        qualification: formData.qualification.trim(),
        hospital: formData.hospital.trim(),
        consultationFee: Number(formData.consultationFee),
        bio: formData.bio.trim()
      };

      const response = await axios.post(
        `${API_URL}/api/doctors/register`,
        doctorData
      );

      setSuccess(
        response.data.message ||
        "Doctor registered successfully!"
      );

      // Do not automatically log in unless the backend
      // also returns a valid authentication token.
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { role: "doctor" }
        });
      }, 1200);

    } catch (err) {
      console.error(
        "Doctor registration error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        "Doctor registration failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="doctor-register-container">

      <div className="doctor-register-card">

        {/* Header */}
        <div className="doctor-register-header">
          <h1>HealthAI</h1>
          <h2>Doctor Registration</h2>
          <p>Create your professional doctor account</p>
        </div>


        <form onSubmit={handleRegister}>

          {/* Error Message */}
          {error && (
            <div className="doctor-register-error" role="alert">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="doctor-register-success" role="status">
              {success}
            </div>
          )}


          {/* Personal Information */}
          <h3>Personal Information</h3>

          <div className="form-group">
            <label htmlFor="doctor-name">Doctor Name *</label>

            <input
              id="doctor-name"
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              minLength={2}
              maxLength={100}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="doctor-email">Email Address *</label>

            <input
              id="doctor-email"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="doctor-password">Password *</label>

            <input
              id="doctor-password"
              type="password"
              name="password"
              placeholder="Create password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
          </div>


          {/* Professional Information */}
          <h3>Professional Information</h3>

          <div className="form-group">
            <label htmlFor="specialization">
              Specialization *
            </label>

            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                -- Select Specialization --
              </option>

              <option value="Cardiologist">Cardiologist</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="General Physician">General Physician</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Orthopedic">Orthopedic</option>
              <option value="Gynecologist">Gynecologist</option>
              <option value="ENT Specialist">ENT Specialist</option>
              <option value="Ophthalmologist">Ophthalmologist</option>
              <option value="Psychiatrist">Psychiatrist</option>
              <option value="Dentist">Dentist</option>
              <option value="Oncologist">Oncologist</option>
              <option value="Urologist">Urologist</option>
            </select>
          </div>


          <div className="form-group">
            <label htmlFor="experience">
              Experience (Years) *
            </label>

            <input
              id="experience"
              type="number"
              name="experience"
              placeholder="Enter experience in years"
              min="0"
              step="0.5"
              value={formData.experience}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="qualification">
              Qualification *
            </label>

            <input
              id="qualification"
              type="text"
              name="qualification"
              placeholder="Example: MBBS, MD"
              value={formData.qualification}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="hospital">
              Hospital / Clinic
            </label>

            <input
              id="hospital"
              type="text"
              name="hospital"
              placeholder="Enter hospital or clinic name"
              value={formData.hospital}
              onChange={handleChange}
            />
          </div>


          <div className="form-group">
            <label htmlFor="consultationFee">
              Consultation Fee (₹) *
            </label>

            <input
              id="consultationFee"
              type="number"
              name="consultationFee"
              placeholder="Enter consultation fee"
              min="0"
              step="0.01"
              value={formData.consultationFee}
              onChange={handleChange}
              required
            />
          </div>


          <div className="form-group">
            <label htmlFor="bio">
              Professional Bio
            </label>

            <textarea
              id="bio"
              name="bio"
              placeholder="Write a short professional introduction"
              rows="4"
              maxLength={1000}
              value={formData.bio}
              onChange={handleChange}
            />

            <small>
              {formData.bio.length}/1000 characters
            </small>
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Registering..."
              : "Register as Doctor"}
          </button>

        </form>


        {/* Login Link */}
        <p className="doctor-login-link">
          Already registered?{" "}
          <Link to="/login">Login here</Link>
        </p>

      </div>

    </div>
  );
}

export default DoctorRegister;
