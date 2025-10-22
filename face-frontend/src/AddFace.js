import React, { useState } from "react";
import Toast from "./Toast";

export default function AddFace() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [crime, setCrime] = useState("");
  const [description, setDescription] = useState("");
  const [toast, setToast] = useState(null);

  const handleUpload = async () => {
    if (!file || !name) {
      setToast({ message: "Name and file are required!", type: "error" });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("age", age);
    formData.append("crime", crime);
    formData.append("description", description);

    try {
      const res = await fetch("http://localhost:8000/add_face", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setToast({ message: data.message, type: "success" });
      } else {
        setToast({ message: data.detail || "Error uploading", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Network error", type: "error" });
    }
  };

  return (
    <div className="container">
      <h2>Add Face</h2>
      <form>
        <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input type="number" placeholder="Age" value={age} onChange={e=>setAge(e.target.value)} />
        <input type="text" placeholder="Crime" value={crime} onChange={e=>setCrime(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <input type="file" onChange={e=>setFile(e.target.files[0])} />
        <button type="button" onClick={handleUpload}>Upload</button>
      </form>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
