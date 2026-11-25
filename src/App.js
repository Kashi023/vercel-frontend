
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Pages
import DoctorDashboard from "./pages/DoctorDashboard";
import Dashboard from "./pages/Dashboard";
import SymptomChecker from "./pages/SymptomChecker";
import ImageAnalysis from "./pages/ImageAnalysis";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorRegister from "./pages/DoctorRegister";
import Register from "./pages/Register";
// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================== */}
        {/* PUBLIC ROUTES */}
        {/* ================================== */}

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/register" element={<Register />} />
        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Doctor Registration */}
        <Route
          path="/doctor/register"
          element={<DoctorRegister />}
        />


        {/* ================================== */}
        {/* PATIENT PROTECTED ROUTES */}
        {/* ================================== */}

        <Route element={<ProtectedRoute allowedRole="user" />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/symptoms"
            element={<SymptomChecker />}
          />

          <Route
            path="/image-analysis"
            element={<ImageAnalysis />}
          />

          <Route
            path="/doctors"
            element={<Doctors />}
          />

          <Route
            path="/appointments"
            element={<Appointments />}
          />

        </Route>


        {/* ================================== */}
        {/* DOCTOR PROTECTED ROUTES */}
        {/* ================================== */}

        <Route element={<ProtectedRoute allowedRole="doctor" />}>

          <Route
            path="/doctor/dashboard"
            element={<DoctorDashboard />}
          />

          <Route
            path="/doctor/appointments"
            element={<DoctorAppointments />}
          />

        </Route>


        {/* ================================== */}
        {/* UNAUTHORIZED ROUTE */}
        {/* ================================== */}

        <Route
          path="/unauthorized"
          element={
            <div className="unauthorized-page">
              <h1>403 - Access Denied</h1>
              <p>You do not have permission to access this page.</p>
            </div>
          }
        />


        {/* ================================== */}
        {/* INVALID ROUTE */}
        {/* ================================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
