
import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Appointments.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const Appointments = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Get all registered doctors
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/doctors`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setDoctors(Array.isArray(data) ? data : data.doctors || data.data || []);
    } catch (error) {
      console.error("Doctor fetching error:", error);
      setError(
        error.response?.data?.message ||
        "Unable to load doctors. Please check the doctor API."
      );
    }
  };

  // Get user's appointments
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/appointments/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setAppointments(
        Array.isArray(data) ? data : data.appointments || data.data || []
      );
    } catch (error) {
      console.error("Appointments fetching error:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!token || role !== "user") {
        setError("Please login as a user to view appointments.");
        setLoading(false);
        return;
      }

      await Promise.all([fetchDoctors(), fetchAppointments()]);
      setLoading(false);
    };

    loadData();
  }, []);

  // Book appointment
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!selectedDoctor || !appointmentDate || !reason.trim()) {
      alert("Please fill all appointment details.");
      return;
    }

    try {
      setBooking(true);

      await axios.post(
        `${API_URL}/api/appointments`,
        {
          doctorId: selectedDoctor._id,
          appointmentDate,
          reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Appointment request sent successfully!");

      setSelectedDoctor(null);
      setAppointmentDate("");
      setReason("");

      await fetchAppointments();
    } catch (error) {
      console.error("Booking error:", error);
      alert(
        error.response?.data?.message ||
        "Unable to book appointment. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  // Cancel pending appointment
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/appointments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Appointment cancelled successfully.");
      await fetchAppointments();
    } catch (error) {
      console.error("Cancel error:", error);
      alert(
        error.response?.data?.message ||
        "Unable to cancel appointment."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="appointments-page">
          <h2>Loading appointments...</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="appointments-page">

        <div className="appointment-header">
          <h1>Appointments</h1>
          <p>Find your doctor and book an appointment easily.</p>
        </div>

        {error && <div className="appointment-error">{error}</div>}

        {/* DOCTOR LIST */}
        <section className="doctor-list-section">
          <h2>Available Doctors</h2>
          <p className="section-description">
            Select a doctor to book your appointment.
          </p>

          {doctors.length === 0 ? (
            <p className="empty-message">No doctors found.</p>
          ) : (
            <div className="doctor-cards">

              {doctors.map((doctor) => (
                <div className="doctor-card" key={doctor._id}>

                  <div className="doctor-avatar">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={doctor.name}
                      />
                    ) : (
                      <span>
                        {doctor.name?.charAt(0).toUpperCase() || "D"}
                      </span>
                    )}
                  </div>

                  <div className="doctor-info">
                    <h3>{doctor.name}</h3>

                    <p>
                      <strong>Doctor ID:</strong>{" "}
                      {doctor._id}
                    </p>

                    <p>
                      <strong>Email:</strong>{" "}
                      {doctor.email}
                    </p>

                    <p>
                      <strong>Specialization:</strong>{" "}
                      {doctor.specialization || "Not specified"}
                    </p>

                    <button
                      className="book-doctor-btn"
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      Book Appointment
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}
        </section>

        {/* BOOKING FORM */}
        {selectedDoctor && (
          <section className="booking-form-section">
            <div className="booking-form-card">

              <h2>Book Appointment</h2>

              <p>
                Selected Doctor: <strong>{selectedDoctor.name}</strong>
              </p>

              <p>
                Doctor ID: <strong>{selectedDoctor._id}</strong>
              </p>

              <form onSubmit={handleBooking}>

                <label>Appointment Date and Time</label>

                <input
                  type="datetime-local"
                  value={appointmentDate}
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />

                <label>Reason for Appointment</label>

                <textarea
                  placeholder="Describe your reason for booking..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows="4"
                  required
                />

                <div className="booking-buttons">
                  <button
                    type="submit"
                    className="confirm-booking-btn"
                    disabled={booking}
                  >
                    {booking ? "Sending Request..." : "Confirm Booking"}
                  </button>

                  <button
                    type="button"
                    className="close-booking-btn"
                    onClick={() => setSelectedDoctor(null)}
                  >
                    Cancel
                  </button>
                </div>

              </form>
            </div>
          </section>
        )}

        {/* MY APPOINTMENTS */}
        <section className="my-appointments-section">
          <h2>My Appointments</h2>
          <p className="section-description">
            Track your appointment requests and their status.
          </p>

          {appointments.length === 0 ? (
            <p className="empty-message">
              You have not booked any appointments yet.
            </p>
          ) : (
            <div className="my-appointment-cards">

              {appointments.map((appointment) => (
                <div
                  className="my-appointment-card"
                  key={appointment._id}
                >

                  <h3>
                    Dr. {appointment.doctor?.name || "Doctor"}
                  </h3>

                  <p>
                    <strong>Doctor ID:</strong>{" "}
                    {appointment.doctor?._id || "Not available"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {appointment.doctor?.email || "Not available"}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {formatDate(appointment.appointmentDate)}
                  </p>

                  <p>
                    <strong>Reason:</strong>{" "}
                    {appointment.reason}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status ${appointment.status}`}>
                      {appointment.status?.toUpperCase()}
                    </span>
                  </p>

                  {appointment.status === "pending" && (
                    <button
                      className="cancel-appointment-btn"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Cancel Request
                    </button>
                  )}

                </div>
              ))}

            </div>
          )}
        </section>

      </div>
    </>
  );
};

export default Appointments;
