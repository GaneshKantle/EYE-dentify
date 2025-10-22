import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <h1>Forensic Face Recognition</h1>
      <p>Upload, recognize, and manage suspect faces with professional forensic accuracy.</p>
      <Link to="/add-face" className="btn cta-btn">Get Started</Link>
    </div>
  );
}
