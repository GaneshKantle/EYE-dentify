import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LandingPage from "./LandingPage";
import AddFace from "./AddFace";
import RecognizeFace from "./RecognizeFace";
import Gallery from "./Gallery";
import "./App.css";  // <-- Import global CSS

export default function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/add-face">Add Face</Link>
        <Link to="/recognize">Recognize</Link>
        <Link to="/gallery">Gallery</Link>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/add-face" element={<AddFace />} />
          <Route path="/recognize" element={<RecognizeFace />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </div>
    </Router>
  );
}
