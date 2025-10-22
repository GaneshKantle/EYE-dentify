import React, { useEffect, useState } from "react";

export default function Gallery() {
  const [faces, setFaces] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/gallery")
      .then(res => res.json())
      .then(data => setFaces(data.faces))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <h2>Gallery</h2>
      <div className="gallery">
        {faces.length === 0 && <p className="message">No faces in the database.</p>}
        {faces.map((face, idx) => (
          <div className="card" key={idx}>
            <img src={face.image_urls[0]} alt={face.name} />
            <h3>{face.name}</h3>
            <p><strong>Age:</strong> {face.age}</p>
            <p><strong>Crime:</strong> {face.crime}</p>
            <p>{face.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
