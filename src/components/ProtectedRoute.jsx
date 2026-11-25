
import React from "react";
import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";

function ProtectedRoute({ allowedRole }) {
  const token = localStorage.getItem("token");

  const role = (
    localStorage.getItem("role") || ""
  ).trim().toLowerCase();

  const location = useLocation();

  // Check authentication
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Check whether role exists
  if (!role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Check authorization
  if (
    allowedRole &&
    role !== allowedRole.trim().toLowerCase()
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Allow access
  return <Outlet />;
}

export default ProtectedRoute;
