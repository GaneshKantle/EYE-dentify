import React, { useEffect, useRef, useState } from "react";
import { Face, GalleryResponse } from "./types";

const Gallery: React.FC = () => {
  const [faces, setFaces] = useState<Face[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCrime, setFilterCrime] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetName, setReplaceTargetName] = useState<string>("");

  const apiBase = "http://localhost:8000";

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/gallery`)
      .then(res => res.json())
      .then((data: GalleryResponse) => {
        setFaces(data.faces || []);
        setLoading(false);
      })
      .catch((err: Error) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Lightweight realtime updates via polling
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${apiBase}/gallery`).then(r => r.json()).then((data: GalleryResponse) => {
        const next = data.faces || [];
        if (JSON.stringify(next) !== JSON.stringify(faces)) {
          setFaces(next);
        }
      }).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, [faces]);

  const filteredFaces = faces.filter(face => {
    const matchesSearch = face.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         face.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrime = !filterCrime || face.crime.toLowerCase().includes(filterCrime.toLowerCase());
    return matchesSearch && matchesCrime;
  });

  const uniqueCrimes = Array.from(new Set(faces.map(face => face.crime).filter(Boolean)));

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      const res = await fetch(`${apiBase}/face/${encodeURIComponent(name)}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setFaces(prev => prev.filter(f => f.name !== name));
    } catch (e) {
      console.error(e);
      alert("Delete failed");
    }
  };

  const handleEdit = async (face: Face) => {
    const nextName = window.prompt("Name", face.name) ?? face.name;
    const nextAge = window.prompt("Age", face.age || "") ?? face.age;
    const nextCrime = window.prompt("Crime", face.crime || "") ?? face.crime;
    const nextDesc = window.prompt("Description", face.description || "") ?? face.description;
    const payload: any = { name: nextName, age: nextAge, crime: nextCrime, description: nextDesc };
    try {
      const res = await fetch(`${apiBase}/face/${encodeURIComponent(face.name)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to update");
      setFaces(prev => prev.map(f => f.name === face.name ? { ...f, ...payload } : f));
    } catch (e) {
      console.error(e);
      alert("Update failed");
    }
  };

  const handleReplaceClick = (name: string) => {
    setReplaceTargetName(name);
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replaceTargetName) return;
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${apiBase}/face/${encodeURIComponent(replaceTargetName)}/image`, {
        method: "POST",
        body: fd
      });
      if (!res.ok) throw new Error("Failed to replace image");
      const data = await res.json();
      // Optimistically replace the primary image url
      setFaces(prev => prev.map(f => f.name === replaceTargetName ? { ...f, image_urls: [data.image_url, ...(f.image_urls?.slice(1) || [])] } : f));
    } catch (err) {
      console.error(err);
      alert("Image replace failed");
    } finally {
      e.target.value = "";
      setReplaceTargetName("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-10 xl:px-16 2xl:px-24 py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Suspect Gallery</h1>
          <p className="text-xs sm:text-sm text-gray-600">Browse and manage suspects</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-40">
              <select
                value={filterCrime}
                onChange={(e) => setFilterCrime(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                aria-label="Filter by crime type"
              >
                <option value="">All Crimes</option>
                {uniqueCrimes.map(crime => (
                  <option key={crime} value={crime}>{crime}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <div className="text-lg font-semibold text-blue-600">{faces.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <div className="text-lg font-semibold text-green-600">{filteredFaces.length}</div>
            <div className="text-xs text-gray-600">Filtered</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
            <div className="text-lg font-semibold text-purple-600">{uniqueCrimes.length}</div>
            <div className="text-xs text-gray-600">Crimes</div>
          </div>
        </div>

        {/* File input for replace image */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          aria-label="Replace image file"
          title="Replace image file"
        />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-600">Loading...</span>
          </div>
        ) : filteredFaces.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2 opacity-50">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Suspects Found</h3>
            <p className="text-sm text-gray-600">
              {faces.length === 0 
                ? "No suspects in database yet."
                : "No suspects match your filters."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3">
            {filteredFaces.map((face, idx) => (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow" key={idx}>
                <div className="relative">
                  <img 
                    src={face.image_urls[0]} 
                    alt={face.name} 
                    className="w-full h-24 sm:h-28 md:h-32 object-cover" 
                  />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      onClick={() => handleEdit(face)}
                      className="px-1.5 py-0.5 text-[10px] bg-white/90 border border-gray-200 rounded hover:bg-white"
                      aria-label="Edit"
                      title="Edit"
                    >Edit</button>
                    <button
                      onClick={() => handleReplaceClick(face.name)}
                      className="px-1.5 py-0.5 text-[10px] bg-white/90 border border-gray-200 rounded hover:bg-white"
                      aria-label="Replace image"
                      title="Replace image"
                    >Img</button>
                    <button
                      onClick={() => handleDelete(face.name)}
                      className="px-1.5 py-0.5 text-[10px] bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100"
                      aria-label="Delete"
                      title="Delete"
                    >Del</button>
                  </div>
                </div>
                <div className="p-2">
                  <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate mb-1">{face.name}</h3>
                  <div className="space-y-0.5 mb-1">
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-gray-500">Age:</span>
                      <span className="text-gray-900 font-medium">{face.age || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-gray-500">Crime:</span>
                      <span className="text-gray-900 font-medium truncate ml-1">{face.crime || 'N/A'}</span>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-600 line-clamp-2 mb-1">{face.description || 'No description'}</p>
                  <div className="text-[9px] text-gray-400">ID: #{String(idx + 1).padStart(3, '0')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
