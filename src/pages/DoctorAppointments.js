
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./DoctorAppointments.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  // ==========================================
  // FETCH DOCTOR APPOINTMENTS
  // ==========================================

  const fetchAppointments = useCallback(async () => {
    const currentToken = localStorage.getItem("token");
    const role = (
      localStorage.getItem("role") || ""
    ).trim().toLowerCase();

    if (!currentToken) {
      setError("Login session not found. Please login again.");
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    if (role !== "doctor") {
      setError("Only doctors can access these appointments.");
      setLoading(false);
      navigate("/dashboard", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/appointments/doctor`,
        {
          headers: {
            Authorization: `Bearer ${currentToken}`
          }
        }
      );

      const appointmentData = response.data.appointments;

      setAppointments(
        Array.isArray(appointmentData)
          ? appointmentData
          : []
      );

    } catch (err) {
      console.error(
        "Fetch appointments error:",
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
        setError("Only doctors can access these appointments.");
      } else {
        setError(
          err.response?.data?.message ||
          "Unable to fetch appointment requests."
        );
      }

    } finally {
      setLoading(false);
    }
  }, [navigate]);


  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);


  // ==========================================
  // UPDATE APPOINTMENT STATUS
  // ==========================================

  const updateStatus = async (appointmentId, status) => {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      setError("Login session not found. Please login again.");
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

      // Refresh appointment list
      await fetchAppointments();

    } catch (err) {
      console.error(
        "Update status error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
        "Unable to update appointment status."
      );

    } finally {
      setUpdatingId(null);
    }
  };


  // ==========================================
  // DATE FORMATTING
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleString();
  };


  // ==========================================
  // FILTER APPOINTMENTS
  // ==========================================

  const filteredAppointments = appointments.filter(
    (appointment) => {
      if (filter === "all") return true;

      return appointment.status === filter;
    }
  );


  // ==========================================
  // APPOINTMENT STATISTICS
  // ==========================================

  const pending = appointments.filter(
    (a) => a.status === "pending"
  ).length;

  const accepted = appointments.filter(
    (a) => a.status === "accepted"
  ).length;

  const rejected = appointments.filter(
    (a) => a.status === "rejected"
  ).length;

  const completed = appointments.filter(
    (a) => a.status === "completed"
  ).length;


  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="doctor-appointments-page">

        {/* Page Heading */}
        <section className="appointments-heading">

          <div>
            <p className="appointments-subtitle">
              DOCTOR PORTAL
            </p>

            <h1>
              Patient Appointments
            </h1>

            <p>
              View patient requests and manage appointment status.
            </p>
          </div>

          <button
            type="button"
            className="refresh-appointments-btn"
            onClick={fetchAppointments}
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </section>


        {/* Appointment Statistics */}
        <section className="appointment-summary">

          <div className="summary-card">
            <h2>{appointments.length}</h2>
            <p>Total Requests</p>
          </div>

          <div className="summary-card pending-card">
            <h2>{pending}</h2>
            <p>Pending</p>
          </div>

          <div className="summary-card accepted-card">
            <h2>{accepted}</h2>
            <p>Accepted</p>
          </div>

          <div className="summary-card rejected-card">
            <h2>{rejected}</h2>
            <p>Rejected</p>
          </div>

          <div className="summary-card completed-card">
            <h2>{completed}</h2>
            <p>Completed</p>
          </div>

        </section>


        {/* Error Message */}
        {error && (
          <div className="appointments-error" role="alert">
            {error}
          </div>
        )}


        {/* Appointment Requests */}
        <section className="appointments-content">

          <div className="appointments-filter">

            <h2>
              Appointment Requests
            </h2>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>

          </div>


          {loading ? (

            <div className="appointments-empty">
              <h3>Loading appointments...</h3>
            </div>

          ) : filteredAppointments.length === 0 ? (

            <div className="appointments-empty">

              <div className="empty-calendar">
                📅
              </div>

              <h3>
                No Appointments Found
              </h3>

              <p>
                Patient appointment requests will appear here
                when someone books an appointment with you.
              </p>

            </div>

          ) : (

            <div className="doctor-requests-list">

              {filteredAppointments.map((appointment) => (

                <article
                  className="doctor-request-card"
                  key={appointment._id}
                >

                  {/* Patient Information */}
                  <div className="request-top">

                    <div className="patient-info">

                      <div className="patient-avatar">
                        {appointment.patient?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "P"}
                      </div>

                      <div>

                        <h3>
                          {appointment.patient?.name ||
                            "Unknown Patient"}
                        </h3>

                        <p>
                          {appointment.patient?.email ||
                            "Email unavailable"}
                        </p>

                      </div>

                    </div>


                    <span
                      className={`appointment-status ${appointment.status}`}
                    >
                      {appointment.status}
                    </span>

                  </div>


                  {/* Appointment Details */}
                  <div className="request-details">

                    <div>
                      <span>
                        Appointment Date
                      </span>

                      <strong>
                        {formatDate(appointment.appointmentDate)}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Request Submitted
                      </span>

                      <strong>
                        {appointment.createdAt
                          ? formatDate(appointment.createdAt)
                          : "Not available"}
                      </strong>
                    </div>

                    <div className="reason-detail">
                      <span>
                        Reason for Appointment
                      </span>

                      <strong>
                        {appointment.reason || "Not specified"}
                      </strong>
                    </div>

                  </div>


                  {/* Pending Appointment Actions */}
                  {appointment.status === "pending" && (

                    <div className="request-actions">

                      <button
                        type="button"
                        className="accept-appointment-btn"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "accepted"
                          )
                        }
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : "✓ Accept Request"}
                      </button>


                      <button
                        type="button"
                        className="reject-appointment-btn"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "rejected"
                          )
                        }
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : "✕ Reject Request"}
                      </button>

                    </div>

                  )}


                  {/* Accepted Appointment Action */}
                  {appointment.status === "accepted" && (

                    <div className="request-actions">

                      <button
                        type="button"
                        className="complete-appointment-btn"
                        disabled={updatingId === appointment._id}
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "completed"
                          )
                        }
                      >
                        {updatingId === appointment._id
                          ? "Updating..."
                          : "Mark as Completed"}
                      </button>

                    </div>

                  )}


                  {/* Rejected Status */}
                  {appointment.status === "rejected" && (

                    <p className="final-status-message">
                      This appointment request was rejected.
                    </p>

                  )}


                  {/* Completed Status */}
                  {appointment.status === "completed" && (

                    <p className="final-status-message">
                      This appointment has been completed.
                    </p>

                  )}

                </article>

              ))}

            </div>

          )}

        </section>

      </main>
    </>
  );
}

export default DoctorAppointments;
