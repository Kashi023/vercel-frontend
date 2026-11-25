
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

function Dashboard() {

  // ==========================================
  // GET LOGGED-IN USER DETAILS
  // ==========================================

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user") || "null"
    );
  } catch (error) {
    console.error("Unable to read user details:", error);
  }


  // ==========================================
  // DASHBOARD UI
  // ==========================================

  return (
    <>
      <Navbar />

      <main className="dashboard">

        {/* ================================== */}
        {/* WELCOME SECTION */}
        {/* ================================== */}

        <section className="welcome-section">

          <div>
            <p className="small-title">
              WELCOME BACK
            </p>

            <h1>
              Your Health,
              <span> Powered by AI.</span>
            </h1>

            <p className="welcome-text">
              {user?.name
                ? `Welcome, ${user.name}! Get personalized health insights, analyze symptoms, and understand your health better with AI-assisted tools.`
                : "Get personalized health insights, analyze symptoms, and understand your health better with AI-assisted tools."
              }
            </p>

            <Link
              to="/symptoms"
              className="check-btn"
            >
              Check Your Symptoms →
            </Link>
          </div>


          {/* AI Assistant Card */}
          <div className="ai-card">

            <div className="ai-icon">
              ✚
            </div>

            <h2>
              AI Health Assistant
            </h2>

            <p>
              I'm here to help you understand your health better.
            </p>

            <div className="online">
              <span></span>
              AI Assistant Online
            </div>

          </div>

        </section>


        {/* ================================== */}
        {/* QUICK ACTIONS */}
        {/* ================================== */}

        <section className="quick-section">

          <div className="section-heading">
            <h2>
              How can we help?
            </h2>

            <p>
              Choose a service to get started
            </p>
          </div>


          <div className="cards">

            {/* Symptom Checker */}
            <Link
              to="/symptoms"
              className="health-card"
            >
              <div className="card-icon">
                🩺
              </div>

              <h3>
                Symptom Checker
              </h3>

              <p>
                Tell us your symptoms and get
                AI-assisted health insights.
              </p>

              <span>
                Check Symptoms →
              </span>
            </Link>


            {/* Find a Doctor */}
            <Link
              to="/doctors"
              className="health-card"
            >
              <div className="card-icon">
                👨‍⚕️
              </div>

              <h3>
                Find a Doctor
              </h3>

              <p>
                Find a healthcare professional
                for consultation and medical advice.
              </p>

              <span>
                Find Doctor →
              </span>
            </Link>


            {/* Medical Image Analysis */}
            <Link
              to="/image-analysis"
              className="health-card"
            >
              <div className="card-icon">
                🔬
              </div>

              <h3>
                Image Analysis
              </h3>

              <p>
                Upload a medical image for AI-assisted
                analysis and educational insights.
              </p>

              <span>
                Analyze Image →
              </span>
            </Link>

          </div>

        </section>


        {/* ================================== */}
        {/* BOTTOM SECTION */}
        {/* ================================== */}

        <section className="bottom-section">


          {/* Recent Activity */}
          <div className="activity-card">

            <div className="card-heading">

              <h2>
                Recent Activity
              </h2>

              <Link to="/appointments">
                View All
              </Link>

            </div>


            <div className="activity">

              <div className="activity-icon">
                🩺
              </div>

              <div>
                <h4>
                  Symptom Check
                </h4>

                <p>
                  No recent checks
                </p>
              </div>

            </div>

          </div>


          {/* Health Tips */}
          <div className="tip-card">

            <div className="tip-icon">
              💡
            </div>

            <h2>
              Daily Health Tip
            </h2>

            <p>
              Staying hydrated, getting enough sleep,
              and maintaining regular physical activity
              can support overall health.
            </p>

          </div>

        </section>

      </main>
    </>
  );
}

export default Dashboard;
