
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./Doctors.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Doctors() {
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = (
    localStorage.getItem("role") || ""
  ).trim().toLowerCase();

  // ==========================================
  // FETCH REGISTERED DOCTORS
  // ==========================================

  useEffect(() => {
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError("");

        // Public doctor listing endpoint
        const response = await axios.get(
          `${API_URL}/api/doctors`
        );

        const doctorList =
          response.data.doctors ||
          response.data.data ||
          response.data;

        if (!Array.isArray(doctorList)) {
          throw new Error("Invalid doctor data received from server.");
        }

        if (isMounted) {
          setDoctors(doctorList);
        }

      } catch (err) {
        console.error(
          "Error fetching doctors:",
          err.response?.data || err.message
        );

        if (isMounted) {
          setError(
            err.response?.data?.message ||
            err.message ||
            "Unable to load registered doctors."
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      isMounted = false;
    };
  }, []);


  // ==========================================
  // GET DOCTOR INFORMATION
  // Supports populated and unpopulated userId
  // ==========================================

  const getDoctorInfo = (doctor) => {
    const linkedUser =
      doctor.userId && typeof doctor.userId === "object"
        ? doctor.userId
        : {};

    return {
      name: doctor.name || linkedUser.name || "Doctor",
      email: doctor.email || linkedUser.email || "",
      specialization: doctor.specialization || "Not provided",
      experience: doctor.experience ?? null,
      qualification: doctor.qualification || "Not provided",
      hospital: doctor.hospital || "Not provided",
      consultationFee: doctor.consultationFee ?? null,
      rating: doctor.rating ?? 0,
      profileImage:
        doctor.profileImage ||
        linkedUser.profileImage ||
        ""
    };
  };


  // ==========================================
  // SPECIALIZATION FILTER OPTIONS
  // ==========================================

  const specializations = useMemo(() => {
    const values = doctors
      .map((doctor) => doctor.specialization)
      .filter(Boolean);

    return [
      "All",
      ...Array.from(new Set(values)).sort()
    ];
  }, [doctors]);


  // ==========================================
  // SEARCH AND FILTER DOCTORS
  // ==========================================

  const filteredDoctors = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const info = getDoctorInfo(doctor);

      const matchesSearch =
        info.name.toLowerCase().includes(searchText) ||
        info.email.toLowerCase().includes(searchText) ||
        info.specialization.toLowerCase().includes(searchText) ||
        info.qualification.toLowerCase().includes(searchText) ||
        info.hospital.toLowerCase().includes(searchText);

      const matchesSpecialization =
        specialization === "All" ||
        info.specialization === specialization;

      return matchesSearch && matchesSpecialization;
    });
  }, [doctors, search, specialization]);


  // ==========================================
  // VIEW DOCTOR PROFILE
  // ==========================================

  const viewProfile = (doctor) => {
    const info = getDoctorInfo(doctor);

    alert(
      `Doctor: Dr. ${info.name}\n` +
      `Specialization: ${info.specialization}\n` +
      `Qualification: ${info.qualification}\n` +
      `Experience: ${
        info.experience !== null
          ? `${info.experience} years`
          : "Not provided"
      }\n` +
      `Hospital: ${info.hospital}\n` +
      `Email: ${info.email || "Not available"}\n` +
      `Consultation Fee: ${
        info.consultationFee !== null
          ? `₹${info.consultationFee}`
          : "Not provided"
      }`
    );
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="doctors-page">

        {/* Page Header */}
        <section className="doctors-header">

          <p className="doctors-label">
            HEALTHCARE PROFESSIONALS
          </p>

          <h1>
            Find the Right <span>Doctor</span>
          </h1>

          <p>
            Connect with registered healthcare professionals
            based on your health needs.
          </p>

        </section>


        {/* Search and Specialization Filter */}
        <section className="doctor-search">

          <div className="search-box">
            <span>🔍</span>

            <input
              type="text"
              placeholder="Search by doctor name, email or specialization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>


          <select
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          >
            {specializations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

        </section>


        {/* Doctor Count */}
        <div className="doctor-count">

          <span>
            {loading
              ? "Loading doctors..."
              : `${filteredDoctors.length} doctors found`}
          </span>

        </div>


        {/* Doctor Listing */}
        <section className="doctor-grid">

          {loading ? (

            <div className="no-doctors">
              <h2>Loading registered doctors...</h2>
            </div>

          ) : error ? (

            <div className="no-doctors">
              <h2>Unable to load doctors</h2>
              <p>{error}</p>
            </div>

          ) : filteredDoctors.length > 0 ? (

            filteredDoctors.map((doctor) => {
              const info = getDoctorInfo(doctor);

              return (
                <article
                  className="doctor-card"
                  key={doctor._id}
                >

                  {/* Doctor Top */}
                  <div className="doctor-top">

                    <div className="doctor-avatar">

                      {info.profileImage ? (
                        <img
                          src={info.profileImage}
                          alt={`Dr. ${info.name}`}
                        />
                      ) : (
                        "👨‍⚕️"
                      )}

                    </div>

                    <div className="doctor-status">
                      <span className="available"></span>
                      {doctor.available === false
                        ? "Unavailable"
                        : "Registered"}
                    </div>

                  </div>


                  {/* Doctor Information */}
                  <h2>
                    Dr. {info.name}
                  </h2>

                  <p className="specialization">
                    {info.specialization}
                  </p>


                  {/* Doctor Details */}
                  <div className="doctor-details">

                    <div>
                      <span>🎓</span>
                      <span>{info.qualification}</span>
                    </div>

                    <div>
                      <span>💼</span>
                      <span>
                        {info.experience !== null
                          ? `${info.experience} years experience`
                          : "Experience not provided"}
                      </span>
                    </div>

                    <div>
                      <span>🏥</span>
                      <span>{info.hospital}</span>
                    </div>

                    <div>
                      <span>✉️</span>
                      <span>
                        {info.email || "Email unavailable"}
                      </span>
                    </div>

                    <div>
                      <span>💰</span>
                      <span>
                        {info.consultationFee !== null
                          ? `₹${info.consultationFee} consultation fee`
                          : "Fee not provided"}
                      </span>
                    </div>

                    <div>
                      <span>⭐</span>
                      <span>{info.rating} / 5 rating</span>
                    </div>

                  </div>


                  {/* Doctor Buttons */}
                  <div className="doctor-buttons">

                    <button
                      className="profile-btn"
                      type="button"
                      onClick={() => viewProfile(doctor)}
                    >
                      View Profile
                    </button>


                    {role === "doctor" ? (

                      <Link
                        to="/doctor/appointments"
                        className="book-btn"
                      >
                        View Appointments
                      </Link>

                    ) : (

                      <Link
                        to="/appointments"
                        state={{
                          doctorId: doctor._id,
                          doctorName: info.name
                        }}
                        className="book-btn"
                        onClick={(e) => {
                          if (doctor.available === false) {
                            e.preventDefault();
                            alert(
                              "This doctor is currently unavailable."
                            );
                          }
                        }}
                      >
                        Book Appointment
                      </Link>

                    )}

                  </div>

                </article>
              );
            })

          ) : (

            <div className="no-doctors">

              <div>🔍</div>

              <h2>
                No registered doctors found
              </h2>

              <p>
                No doctors currently match your search.
                Try another name or specialization.
              </p>

            </div>

          )}

        </section>


        {/* Disclaimer */}
        <section className="doctor-disclaimer">

          <strong>
            ⚠ Important Notice
          </strong>

          <p>
            Doctor details are fetched from registered accounts.
            Please verify credentials and appointment availability
            before booking.
          </p>

        </section>

      </main>
    </>
  );
}

export default Doctors;
