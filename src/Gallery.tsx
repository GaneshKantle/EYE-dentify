import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Face, GalleryResponse } from "./types";
import { apiClient } from "./lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Edit, Trash2, Eye, PenTool } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";

interface Sketch {
  _id: string;
  name: string;
  suspect?: string;
  eyewitness?: string;
  officer?: string;
  date?: string;
  reason?: string;
  description?: string;
  priority?: string;
  status?: string;
  cloudinary_url?: string;
  created_at?: string;
  updated_at?: string;
}

const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("criminals");
  const [faces, setFaces] = useState<Face[]>([]);
  const [sketches, setSketches] = useState<Sketch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sketchesLoading, setSketchesLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterCrime, setFilterCrime] = useState<string>("");
  const [sketchSearchTerm, setSketchSearchTerm] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTargetName, setReplaceTargetName] = useState<string>("");
  const [deleteSketchId, setDeleteSketchId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Load criminals
  useEffect(() => {
    const loadGallery = async () => {
    setLoading(true);
      try {
        const data = await apiClient.directGet<GalleryResponse>("/gallery");
        setFaces(data.faces || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  // Load sketches
  useEffect(() => {
    const loadSketches = async () => {
      setSketchesLoading(true);
      try {
        const data = await apiClient.directGet<{ sketches: Sketch[] }>("/sketches");
        setSketches(data.sketches || []);
      } catch (err: any) {
        console.error('Failed to load sketches:', err);
      } finally {
        setSketchesLoading(false);
      }
    };
    loadSketches();
  }, []);

  // Lightweight realtime updates via polling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await apiClient.directGet<GalleryResponse>("/gallery");
        const next = data.faces || [];
        if (JSON.stringify(next) !== JSON.stringify(faces)) {
          setFaces(next);
        }
      } catch (err) {
        // Silently fail on polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [faces]);

  // Refresh sketches when tab is active
  useEffect(() => {
    if (activeTab === 'sketches') {
      const loadSketches = async () => {
        try {
          const data = await apiClient.directGet<{ sketches: Sketch[] }>("/sketches");
          setSketches(data.sketches || []);
        } catch (err: any) {
          console.error('Failed to load sketches:', err);
        }
      };
      loadSketches();
    }
  }, [activeTab]);

  const filteredFaces = faces.filter(face => {
    const matchesSearch = face.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         face.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrime = !filterCrime || face.crime.toLowerCase().includes(filterCrime.toLowerCase());
    return matchesSearch && matchesCrime;
  });

  const uniqueCrimes = Array.from(new Set(faces.map(face => face.crime).filter(Boolean)));

  // Filter sketches
  const filteredSketches = sketches.filter(sketch => {
    const matchesSearch = 
      sketch.name.toLowerCase().includes(sketchSearchTerm.toLowerCase()) ||
      (sketch.suspect && sketch.suspect.toLowerCase().includes(sketchSearchTerm.toLowerCase())) ||
      (sketch.officer && sketch.officer.toLowerCase().includes(sketchSearchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Handle sketch operations
  const handleSketchEdit = (sketchId: string) => {
    navigate(`/sketch?id=${sketchId}`);
  };

  const handleSketchView = (sketchId: string) => {
    navigate(`/sketch?id=${sketchId}`);
  };

  const handleSketchDelete = async () => {
    if (!deleteSketchId) return;
    try {
      await apiClient.directDelete(`/sketches/${deleteSketchId}`);
      setSketches(prev => prev.filter(s => s._id !== deleteSketchId));
      setShowDeleteDialog(false);
      setDeleteSketchId(null);
    } catch (err: any) {
      console.error('Failed to delete sketch:', err);
      alert('Failed to delete sketch');
    }
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await apiClient.directDelete(`/face/${encodeURIComponent(name)}`);
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
      await apiClient.directPut(`/face/${encodeURIComponent(face.name)}`, payload);
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
      const data = await apiClient.directUploadFile<{image_url: string}>(`/face/${encodeURIComponent(replaceTargetName)}/image`, fd);
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-5 lg:py-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-slate-900">Criminal Database</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1 sm:mt-1.5">Browse and manage suspects and sketches from the database</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4 bg-white rounded-lg sm:rounded-xl shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
            <TabsTrigger value="criminals" className="text-xs sm:text-sm">Criminals</TabsTrigger>
            <TabsTrigger value="sketches" className="text-xs sm:text-sm">Sketches</TabsTrigger>
          </TabsList>

          {/* Criminals Tab */}
          <TabsContent value="criminals" className="mt-0 space-y-3 sm:space-y-4">

        {/* Controls */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              />
            </div>
            <div className="sm:w-40">
              <select
                value={filterCrime}
                onChange={(e) => setFilterCrime(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 bg-white transition-all"
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
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.12)]">
            <div className="text-base sm:text-lg md:text-xl font-semibold text-blue-600">{faces.length}</div>
            <div className="text-xs text-slate-600">Total</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.12)]">
            <div className="text-base sm:text-lg md:text-xl font-semibold text-emerald-600">{filteredFaces.length}</div>
            <div className="text-xs text-slate-600">Filtered</div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.12)]">
            <div className="text-base sm:text-lg md:text-xl font-semibold text-purple-600">{uniqueCrimes.length}</div>
            <div className="text-xs text-slate-600">Crimes</div>
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
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-2 text-xs sm:text-sm text-slate-600">Loading...</span>
          </div>
        ) : filteredFaces.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
            <div className="text-3xl sm:text-4xl mb-2 opacity-50">📋</div>
            <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-1">No Suspects Found</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              {faces.length === 0 
                ? "No suspects in database yet."
                : "No suspects match your filters."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3">
            {filteredFaces.map((face, idx) => (
              <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12),0_0_0_1px_rgba(148,163,184,0.15)]" key={idx}>
                <div className="relative">
                  <img 
                    src={face.image_urls[0]} 
                    alt={face.name} 
                    className="w-full h-20 sm:h-24 md:h-28 lg:h-32 object-cover" 
                    loading="lazy"
                  />
                  <div className="absolute top-1 right-1 flex gap-0.5 sm:gap-1">
                    <button
                      onClick={() => handleEdit(face)}
                      className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] bg-white/95 backdrop-blur-sm border border-slate-200 rounded hover:bg-white transition-colors"
                      aria-label="Edit"
                      title="Edit"
                    >Edit</button>
                    <button
                      onClick={() => handleReplaceClick(face.name)}
                      className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] bg-white/95 backdrop-blur-sm border border-slate-200 rounded hover:bg-white transition-colors"
                      aria-label="Replace image"
                      title="Replace image"
                    >Img</button>
                    <button
                      onClick={() => handleDelete(face.name)}
                      className="px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] bg-red-50 border border-red-200 text-red-700 rounded hover:bg-red-100 transition-colors"
                      aria-label="Delete"
                      title="Delete"
                    >Del</button>
                  </div>
                </div>
                <div className="p-1.5 sm:p-2">
                  <h3 className="text-xs sm:text-sm font-medium text-slate-900 truncate mb-1">{face.name}</h3>
                  <div className="space-y-0.5 mb-1">
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-slate-500">Age:</span>
                      <span className="text-slate-900 font-medium">{face.age || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-slate-500">Crime:</span>
                      <span className="text-slate-900 font-medium truncate ml-1">{face.crime || 'N/A'}</span>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-600 line-clamp-2 mb-1">{face.description || 'No description'}</p>
                  <div className="text-[9px] text-slate-400">ID: #{String(idx + 1).padStart(3, '0')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
          </TabsContent>

          {/* Sketches Tab */}
          <TabsContent value="sketches" className="mt-0 space-y-3 sm:space-y-4">
            {/* Controls */}
            <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
              <input
                type="text"
                placeholder="Search sketches by name, suspect, or officer..."
                value={sketchSearchTerm}
                onChange={(e) => setSketchSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.12)]">
                <div className="text-base sm:text-lg md:text-xl font-semibold text-blue-600">{sketches.length}</div>
                <div className="text-xs text-slate-600">Total</div>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.12)]">
                <div className="text-base sm:text-lg md:text-xl font-semibold text-emerald-600">{filteredSketches.length}</div>
                <div className="text-xs text-slate-600">Filtered</div>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 text-center shadow-[0_2px_6px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.12)]">
                <div className="text-base sm:text-lg md:text-xl font-semibold text-purple-600">
                  {sketches.filter(s => s.status === 'completed').length}
                </div>
                <div className="text-xs text-slate-600">Completed</div>
              </div>
            </div>

            {/* Sketches Content */}
            {sketchesLoading ? (
              <div className="flex items-center justify-center py-8 sm:py-12">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="ml-2 text-xs sm:text-sm text-slate-600">Loading sketches...</span>
              </div>
            ) : filteredSketches.length === 0 ? (
              <div className="bg-white rounded-lg sm:rounded-xl p-6 sm:p-8 text-center shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
                <div className="text-3xl sm:text-4xl mb-2 opacity-50">🎨</div>
                <h3 className="text-base sm:text-lg font-medium text-slate-900 mb-1">No Sketches Found</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  {sketches.length === 0 
                    ? "No sketches saved yet. Create a sketch from the sketch page."
                    : "No sketches match your search."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredSketches.map((sketch) => (
                  <div 
                    key={sketch._id} 
                    className="bg-white rounded-lg sm:rounded-xl overflow-hidden transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_0_0_1px_rgba(148,163,184,0.15)]"
                  >
                    <div className="relative">
                      {sketch.cloudinary_url ? (
                        <img 
                          src={sketch.cloudinary_url} 
                          alt={sketch.name} 
                          className="w-full h-40 sm:h-44 md:h-48 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-40 sm:h-44 md:h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <PenTool className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-amber-600 opacity-50" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${
                          sketch.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          sketch.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          sketch.status === 'review' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {sketch.status || 'draft'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 h-7 text-[10px] sm:text-xs"
                          onClick={() => handleSketchView(sketch._id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 h-7 text-[10px] sm:text-xs"
                          onClick={() => handleSketchEdit(sketch._id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 w-7 p-0"
                          onClick={() => {
                            setDeleteSketchId(sketch._id);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3">
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1.5 sm:mb-2 truncate">{sketch.name}</h3>
                      <div className="space-y-1 text-[10px] sm:text-xs text-slate-600">
                        {sketch.suspect && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Suspect:</span>
                            <span className="font-medium text-slate-900">{sketch.suspect}</span>
                          </div>
                        )}
                        {sketch.officer && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Officer:</span>
                            <span className="font-medium text-slate-900">{sketch.officer}</span>
                          </div>
                        )}
                        {sketch.date && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Date:</span>
                            <span className="font-medium text-slate-900">
                              {new Date(sketch.date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {sketch.priority && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Priority:</span>
                            <span className={`font-medium capitalize ${
                              sketch.priority === 'urgent' ? 'text-red-600' :
                              sketch.priority === 'high' ? 'text-orange-600' :
                              sketch.priority === 'medium' ? 'text-yellow-600' :
                              'text-emerald-600'
                            }`}>
                              {sketch.priority}
                            </span>
                          </div>
                        )}
                      </div>
                      {sketch.description && (
                        <p className="text-[10px] sm:text-xs text-slate-600 mt-2 line-clamp-2">{sketch.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sketch</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this sketch? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setShowDeleteDialog(false);
                setDeleteSketchId(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSketchDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Gallery;
