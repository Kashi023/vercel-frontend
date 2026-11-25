
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  // Get logged-in user details
  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "")
    .trim()
    .toLowerCase();

  const isDoctor = role === "doctor";
  const isLoggedIn = Boolean(token);

  // Role-based navigation paths
  const dashboardPath = isDoctor
    ? "/doctor/dashboard"
    : "/dashboard";

  const appointmentsPath = isDoctor
    ? "/doctor/appointments"
    : "/appointments";

  const profilePath = isDoctor
    ? "/doctor/profile"
    : "/profile";


  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true
    });
  };


  // Do not display navbar when logged out
  if (!isLoggedIn) {
    return null;
  }


  // ==========================================
  // NAVBAR UI
  // ==========================================

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link to={dashboardPath} className="logo">
        <span>✚</span>
        HealthAI
      </Link>


      {/* Navigation Links */}
      <div className="nav-links">

        <Link to={dashboardPath}>
          Dashboard
        </Link>


        {/* Patient-only links */}
        {!isDoctor && (
          <>
            <Link to="/symptoms">
              Symptoms
            </Link>

            <Link to="/image-analysis">
              Image Analysis
            </Link>

            <Link to="/doctors">
              Doctors
            </Link>
          </>
        )}


        {/* Appointments */}
        <Link to={appointmentsPath}>
          Appointments
        </Link>

      </div>


      {/* Profile and Logout */}
      <div className="nav-actions">

        <button
          type="button"
          className="profile-btn"
          onClick={() => navigate(profilePath)}
        >
          👤 Profile
        </button>

        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}

export default Navbar;
