
import React, { useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./DoctorDashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("token");
  const role = (localStorage.getItem("role") || "")
    .trim()
    .toLowerCase();

  // ==========================================
  // FETCH DOCTOR PROFILE AND APPOINTMENTS
  // ==========================================

  const fetchDoctorData = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    const currentRole = (
      localStorage.getItem("role") || ""
    ).trim().toLowerCase();

    if (!currentToken || currentRole !== "doctor") {
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    try {
      setError("");
      setRefreshing(true);

      const config = {
        headers: {
          Authorization: `Bearer ${currentToken}`
        }
      };

      const [profileResponse, appointmentResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/doctors/profile`, config),
          axios.get(`${API_URL}/api/appointments/doctor`, config)
        ]);

      // Extract doctor profile
      const doctor =
        profileResponse.data.doctor ||
        profileResponse.data.user ||
        profileResponse.data;

      if (!doctor || !doctor.name) {
        throw new Error("Doctor profile not found.");
      }

      setUser(doctor);

      // Extract appointment data
      const appointmentData =
        appointmentResponse.data.appointments;

      setAppointments(
        Array.isArray(appointmentData)
          ? appointmentData
          : []
      );

    } catch (err) {
      console.error(
        "Doctor dashboard error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      if (err.response?.status === 403) {
        setError("Only doctors can access this dashboard.");
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load doctor dashboard."
        );
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate]);


  useEffect(() => {
    fetchDoctorData();
  }, [fetchDoctorData]);


  // ==========================================
  // UPDATE APPOINTMENT STATUS
  // ==========================================

  const updateAppointment = async (appointmentId, status) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setUpdatingId(appointmentId);
      setError("");

      await axios.patch(
        `${API_URL}/api/appointments/${appointmentId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      // Reload updated appointment data
      await fetchDoctorData();

    } catch (err) {
      console.error(
        "Appointment update error:",
        err.response?.data || err.message
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
        return;
      }

      setError(
        err.response?.data?.message ||
        "Unable to update appointment."
      );

    } finally {
      setUpdatingId(null);
    }
  };


  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date, includeTime = true) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return includeTime
      ? parsedDate.toLocaleString()
      : parsedDate.toLocaleDateString();
  };


  // ==========================================
  // AUTHENTICATION CHECK
  // ==========================================

  if (!token || role !== "doctor") {
    return <Navigate to="/login" replace />;
  }


  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="dashboard doctor-dashboard">
          <h2>Loading doctor dashboard...</h2>
        </main>
      </>
    );
  }


  // ==========================================
  // PROFILE ERROR STATE
  // ==========================================

  if (!user) {
    return (
      <>
        <Navbar />

        <main className="dashboard doctor-dashboard">

          <div className="doctor-error">
            {error || "Unable to load your doctor profile."}
          </div>

          <button
            type="button"
            onClick={fetchDoctorData}
            disabled={refreshing}
          >
            {refreshing ? "Loading..." : "Try Again"}
          </button>

        </main>
      </>
    );
  }


  // ==========================================
  // APPOINTMENT STATISTICS
  // ==========================================

  const pendingCount = appointments.filter(
    (item) => item.status === "pending"
  ).length;

  const acceptedCount = appointments.filter(
    (item) => item.status === "accepted"
  ).length;

  const rejectedCount = appointments.filter(
    (item) => item.status === "rejected"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "completed"
  ).length;


  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="dashboard doctor-dashboard">

        {/* Welcome Section */}
        <section className="welcome-section">

          <div>
            <p className="small-title">
              DOCTOR PORTAL
            </p>

            <h1>
              Welcome, <span>Dr. {user.name || "Doctor"}.</span>
            </h1>

            <p className="welcome-text">
              Manage your healthcare activities, connect with
              patients, and review appointment requests through HealthAI.
            </p>

            <a
              href="#patient-appointments"
              className="check-btn"
            >
              View Appointment Requests →
            </a>
          </div>


          <div className="ai-card">

            <div className="ai-icon">
              ⚕
            </div>

            <h2>
              HealthAI Doctor Portal
            </h2>

            <p>
              Your healthcare management workspace.
            </p>

            <div className="online">
              <span></span>
              Portal Active
            </div>

          </div>

        </section>


        {/* Appointment Statistics */}
        <section className="doctor-appointment-stats">

          <div className="doctor-stat-card">
            <h2>{appointments.length}</h2>
            <p>Total Requests</p>
          </div>

          <div className="doctor-stat-card">
            <h2>{pendingCount}</h2>
            <p>Pending Requests</p>
          </div>

          <div className="doctor-stat-card">
            <h2>{acceptedCount}</h2>
            <p>Accepted</p>
          </div>

          <div className="doctor-stat-card">
            <h2>{rejectedCount}</h2>
            <p>Rejected</p>
          </div>

          <div className="doctor-stat-card">
            <h2>{completedCount}</h2>
            <p>Completed</p>
          </div>

        </section>


        {/* Patient Appointment Requests */}
        <section
          className="doctor-requests-section"
          id="patient-appointments"
        >

          <div className="doctor-section-heading">

            <div>
              <h2>
                Patient Appointment Requests
              </h2>

              <p>
                View and manage requests sent by patients.
              </p>
            </div>

            <button
              type="button"
              className="doctor-refresh-btn"
              onClick={fetchDoctorData}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>

          </div>


          {error && (
            <div className="doctor-error" role="alert">
              {error}
            </div>
          )}


          {appointments.length === 0 ? (

            <div className="doctor-no-appointments">

              <div className="empty-icon">
                📅
              </div>

              <h3>
                No Appointment Requests Yet
              </h3>

              <p>
                When a patient books an appointment with you,
                their request will appear here.
              </p>

            </div>

          ) : (

            <div className="doctor-appointment-list">

              {appointments.map((appointment) => (

                <article
                  className="doctor-appointment-card"
                  key={appointment._id}
                >

                  {/* Patient Information */}
                  <div className="doctor-appointment-header">

                    <div>
                      <h3>
                        {appointment.patient?.name ||
                          "Unknown Patient"}
                      </h3>

                      <p>
                        {appointment.patient?.email ||
                          "Email not available"}
                      </p>
                    </div>

                    <span
                      className={`doctor-status ${appointment.status}`}
                    >
                      {appointment.status}
                    </span>

                  </div>


                  {/* Appointment Details */}
                  <div className="doctor-appointment-details">

                    <p>
                      <strong>Appointment Date:</strong>{" "}
                      {formatDate(appointment.appointmentDate)}
                    </p>

                    <p>
                      <strong>Reason:</strong>{" "}
                      {appointment.reason || "Not specified"}
                    </p>

                    <p>
                      <strong>Request Submitted:</strong>{" "}
                      {formatDate(appointment.createdAt, false)}
                    </p>

                  </div>


                  {/* Pending Appointment Actions */}
                  {appointment.status === "pending" && (

                    <div className="doctor-action-buttons">

                      <button
                        type="button"
                        className="doctor-accept-btn"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          updateAppointment(
                            appointment._id,
                            "accepted"
                          )
                        }
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : "Accept Request"}
                      </button>


                      <button
                        type="button"
                        className="doctor-reject-btn"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          updateAppointment(
                            appointment._id,
                            "rejected"
                          )
                        }
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : "Reject Request"}
                      </button>

                    </div>

                  )}


                  {/* Accepted Appointment Action */}
                  {appointment.status === "accepted" && (

                    <button
                      type="button"
                      className="doctor-complete-btn"
                      disabled={updatingId === appointment._id}
                      onClick={() =>
                        updateAppointment(
                          appointment._id,
                          "completed"
                        )
                      }
                    >
                      {updatingId === appointment._id
                        ? "Updating..."
                        : "Mark as Completed"}
                    </button>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>


        {/* Doctor Services */}
        <section className="quick-section">

          <div className="section-heading">
            <h2>Doctor Services</h2>
            <p>Manage your activities</p>
          </div>


          <div className="cards">

            <a
              href="#patient-appointments"
              className="health-card"
            >
              <div className="card-icon">
                📅
              </div>

              <h3>Appointments</h3>

              <p>
                View and manage patient appointment requests.
              </p>

              <span>
                View Requests →
              </span>
            </a>


            <Link
              to="/doctor/appointments"
              className="health-card"
            >
              <div className="card-icon">
                📋
              </div>

              <h3>All Appointments</h3>

              <p>
                Open the dedicated appointment management page.
              </p>

              <span>
                View All →
              </span>
            </Link>

          </div>

        </section>


        {/* Bottom Section */}
        <section className="bottom-section">

          <div className="activity-card">

            <div className="card-heading">
              <h2>Patient Activity</h2>
            </div>

            <div className="activity">

              <div className="activity-icon">
                📋
              </div>

              <div>
                <h4>Appointment Management</h4>
                <p>Check your appointment requests.</p>
              </div>

            </div>

          </div>


          <div className="tip-card">

            <div className="tip-icon">
              💡
            </div>

            <h2>Healthcare Reminder</h2>

            <p>
              Review patient information carefully and
              maintain appropriate patient confidentiality.
            </p>

          </div>

        </section>

      </main>
    </>
  );
}

export default DoctorDashboard;
