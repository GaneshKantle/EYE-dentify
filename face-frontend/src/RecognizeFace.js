import React, { useState } from "react";
import axios from "axios";

export default function RecognizeFace() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleRecognize = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:8000/recognize_face", formData);
      setResult(res.data);
    } catch (err) {
      setResult({ status: "error", message: err.response?.data?.detail || err.message });
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ color: "#00ffff", marginBottom: "1rem" }}>Recognize Face / Sketch</h2>
      <form onSubmit={handleRecognize} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
        <button type="submit" style={{ ...buttonStyle }}>Check Recognition</button>
      </form>

      {result && (
        <div style={{ marginTop: "2rem", background: "#1a1a1a", padding: "1rem", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,255,255,0.2)" }}>
          {result.status === "recognized" ? (
            <>
              <p><b>Name:</b> {result.name}</p>
              <p><b>Age:</b> {result.age}</p>
              <p><b>Crime:</b> {result.crime}</p>
              <p><b>Description:</b> {result.description}</p>
              <p><b>Similarity:</b> {(result.similarity*100).toFixed(2)}%</p>
              <img src={result.image_url} alt={result.name} style={{ maxWidth: "300px", marginTop: "1rem", borderRadius: "8px" }} />
            </>
          ) : (
            <p>❌ Not recognized. Best score: {(result.best_score*100 || 0).toFixed(2)}%</p>
          )}
        </div>
      )}
    </div>
  );
}

const buttonStyle = {
  background: "#00ffff",
  color: "#111",
  fontWeight: "bold",
  padding: "0.6rem",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "0.3s"
};
