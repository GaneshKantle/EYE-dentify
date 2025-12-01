import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Face, GalleryResponse } from "./types";
import { apiClient } from "./lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Edit, Trash2, Eye, PenTool, UserPlus, Download, X } from "lucide-react";
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
import EditFaceModal from "./components/Gallery/EditFaceModal";

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
  const [deleteSketchId, setDeleteSketchId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingFace, setEditingFace] = useState<Face | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewerImage, setViewerImage] = useState<{ url: string; name: string } | null>(null);

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
        // Skip polling when tab is not visible to reduce unnecessary load
        if (document.hidden) {
          return;
        }
        const data = await apiClient.directGet<GalleryResponse>("/gallery");
        const next = data.faces || [];
        if (JSON.stringify(next) !== JSON.stringify(faces)) {
          setFaces(next);
        }
      } catch (err) {
        // Silently fail on polling errors
      }
    }, 15000);
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

  const handleEdit = (face: Face) => {
    setEditingFace(face);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (data: { name: string; age?: string; crime?: string; description?: string }) => {
    if (!editingFace) return;
    const payload: any = { name: data.name, age: data.age, crime: data.crime, description: data.description };
    try {
      await apiClient.directPatch(`/face/${encodeURIComponent(editingFace.name)}`, payload);
      setFaces(prev => prev.map(f => f.name === editingFace.name ? { ...f, ...payload } : f));
    } catch (e) {
      console.error(e);
      alert("Update failed");
      throw e;
    }
  };

  const handleFaceImageChange = async (file: File) => {
    if (!editingFace) return;
      const fd = new FormData();
      fd.append("file", file);
    const data = await apiClient.directUploadFile<{image_url: string}>(`/face/${encodeURIComponent(editingFace.name)}/image`, fd);
    setFaces(prev => prev.map(f => f.name === editingFace.name ? { ...f, image_urls: [data.image_url, ...(f.image_urls?.slice(1) || [])] } : f));
    setEditingFace(prev => prev ? { ...prev, image_urls: [data.image_url, ...(prev.image_urls?.slice(1) || [])] } : null);
  };

  const handleDownloadImage = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${name}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-5 lg:py-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-slate-200/60">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-slate-900">Criminal Database</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-snug mt-1">Browse and manage suspects and sketches</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-3 bg-white rounded-lg border border-slate-200/60 shadow-sm">
            <TabsTrigger value="criminals" className="text-xs sm:text-sm">Criminals</TabsTrigger>
            <TabsTrigger value="sketches" className="text-xs sm:text-sm">Sketches</TabsTrigger>
          </TabsList>

          {/* Criminals Tab */}
          <TabsContent value="criminals" className="mt-0 space-y-3 sm:space-y-4">

        {/* Controls */}
        <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-slate-200/60">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search suspects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 h-9 sm:h-10 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
              />
            </div>
            <div className="sm:w-40">
              <select
                value={filterCrime}
                onChange={(e) => setFilterCrime(e.target.value)}
                className="w-full px-3 py-2 h-9 sm:h-10 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 bg-white transition-all"
                aria-label="Filter by crime type"
              >
                <option value="">All Crimes</option>
                {uniqueCrimes.map(crime => (
                  <option key={crime} value={crime}>{crime}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => navigate('/add')}
              className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus className="w-4 h-4 mr-1.5 sm:mr-2" />
              Add Criminal
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-lg p-3 text-center border border-slate-200/60 shadow-sm">
            <div className="text-lg sm:text-xl font-semibold text-blue-600">{faces.length}</div>
            <div className="text-xs text-slate-600">Total</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-slate-200/60 shadow-sm">
            <div className="text-lg sm:text-xl font-semibold text-emerald-600">{filteredFaces.length}</div>
            <div className="text-xs text-slate-600">Filtered</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border border-slate-200/60 shadow-sm">
            <div className="text-lg sm:text-xl font-semibold text-purple-600">{uniqueCrimes.length}</div>
            <div className="text-xs text-slate-600">Crimes</div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="ml-2 text-xs sm:text-sm text-slate-600">Loading...</span>
          </div>
        ) : filteredFaces.length === 0 ? (
          <div className="bg-white rounded-lg p-6 sm:p-8 text-center border border-slate-200/60">
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
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
            {filteredFaces.map((face, idx) => (
              <div className="group bg-white rounded-xl xs:rounded-2xl overflow-hidden transition-all duration-300 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1" key={idx}>
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img 
                    src={face.image_urls[0]} 
                    alt={face.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-2 xs:top-3 right-2 xs:right-3 flex gap-1.5 xs:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={() => setViewerImage({ url: face.image_urls[0], name: face.name })}
                      className="p-1.5 xs:p-2 bg-white rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg border border-slate-200"
                      aria-label="View Image"
                      title="View Image"
                    >
                      <Eye className="w-3 h-3 xs:w-4 xs:h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(face)}
                      className="p-1.5 xs:p-2 bg-white rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-lg border border-slate-200"
                      aria-label="Edit"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3 xs:w-4 xs:h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(face.name)}
                      className="p-1.5 xs:p-2 bg-white rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg border border-slate-200"
                      aria-label="Delete"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3 xs:w-4 xs:h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white truncate drop-shadow-lg">{face.name}</h3>
                  </div>
                </div>
                <div className="p-3 xs:p-4 space-y-2 xs:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500">Age</span>
                    <span className="text-xs xs:text-sm sm:text-base font-semibold text-slate-800">{face.age || 'N/A'}</span>
                    </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500">Crime</span>
                    <span className="text-xs xs:text-sm sm:text-base font-semibold text-red-600 truncate ml-2 max-w-[60%] text-right">{face.crime || 'N/A'}</span>
                  </div>
                  <p className="text-[10px] xs:text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed pt-1 border-t border-slate-100">{face.description || 'No description available'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
          </TabsContent>

          {/* Sketches Tab */}
          <TabsContent value="sketches" className="mt-0 space-y-3 sm:space-y-4">
            {/* Controls */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-slate-200/60">
              <input
                type="text"
                placeholder="Search sketches..."
                value={sketchSearchTerm}
                onChange={(e) => setSketchSearchTerm(e.target.value)}
                className="w-full px-3 py-2 h-9 sm:h-10 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-all"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white rounded-lg p-3 text-center border border-slate-200/60 shadow-sm">
                <div className="text-lg sm:text-xl font-semibold text-blue-600">{sketches.length}</div>
                <div className="text-xs text-slate-600">Total</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-slate-200/60 shadow-sm">
                <div className="text-lg sm:text-xl font-semibold text-emerald-600">{filteredSketches.length}</div>
                <div className="text-xs text-slate-600">Filtered</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center border border-slate-200/60 shadow-sm">
                <div className="text-lg sm:text-xl font-semibold text-purple-600">
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
              <div className="bg-white rounded-lg p-6 sm:p-8 text-center border border-slate-200/60">
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
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                {filteredSketches.map((sketch) => (
                  <div 
                    key={sketch._id} 
                    className="group bg-white rounded-xl xs:rounded-2xl overflow-hidden transition-all duration-300 border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {sketch.cloudinary_url ? (
                        <img 
                          src={sketch.cloudinary_url} 
                          alt={sketch.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <PenTool className="w-12 h-12 xs:w-16 xs:h-16 text-amber-600 opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 xs:top-3 left-2 xs:left-3">
                        <span className={`px-2 xs:px-3 py-1 text-[10px] xs:text-xs font-medium rounded-full backdrop-blur-md ${
                          sketch.status === 'completed' ? 'bg-emerald-500/90 text-white' :
                          sketch.status === 'in-progress' ? 'bg-blue-500/90 text-white' :
                          sketch.status === 'review' ? 'bg-purple-500/90 text-white' :
                          'bg-slate-500/90 text-white'
                        }`}>
                          {sketch.status || 'draft'}
                        </span>
                      </div>
                      <div className="absolute top-2 xs:top-3 right-2 xs:right-3 flex gap-1.5 xs:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={() => sketch.cloudinary_url && setViewerImage({ url: sketch.cloudinary_url, name: sketch.name })}
                          className="p-1.5 xs:p-2 bg-white rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-lg border border-slate-200"
                          aria-label="View Image"
                          title="View Image"
                        >
                          <Eye className="w-3 h-3 xs:w-4 xs:h-4" />
                        </button>
                        <button
                          onClick={() => handleSketchEdit(sketch._id)}
                          className="p-1.5 xs:p-2 bg-white rounded-lg hover:bg-emerald-500 hover:text-white transition-all shadow-lg border border-slate-200"
                          aria-label="Edit"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3 xs:w-4 xs:h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteSketchId(sketch._id);
                            setShowDeleteDialog(true);
                          }}
                          className="p-1.5 xs:p-2 bg-white rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg border border-slate-200"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 xs:w-4 xs:h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 xs:p-4 bg-gradient-to-t from-black/70 to-transparent">
                        <h3 className="text-sm xs:text-base sm:text-lg font-bold text-white truncate drop-shadow-lg">{sketch.name}</h3>
                      </div>
                    </div>
                    <div className="p-3 xs:p-4 space-y-2 xs:space-y-3">
                        {sketch.suspect && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500">Suspect</span>
                          <span className="text-xs xs:text-sm sm:text-base font-semibold text-slate-800 truncate ml-2 max-w-[60%] text-right">{sketch.suspect}</span>
                          </div>
                        )}
                        {sketch.officer && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500">Officer</span>
                          <span className="text-xs xs:text-sm sm:text-base font-semibold text-slate-800 truncate ml-2 max-w-[60%] text-right">{sketch.officer}</span>
                          </div>
                        )}
                        {sketch.priority && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500">Priority</span>
                          <span className={`text-xs xs:text-sm sm:text-base font-semibold capitalize ${
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

        {/* Edit Face Modal */}
        <EditFaceModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          face={editingFace}
          onSave={handleSaveEdit}
          onImageChange={handleFaceImageChange}
        />

        {/* Image Viewer Modal */}
        {viewerImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 xs:p-6 sm:p-8"
            onClick={() => setViewerImage(null)}
          >
            <div className="absolute top-4 right-4 xs:top-6 xs:right-6 flex gap-2 xs:gap-3 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadImage(viewerImage.url, viewerImage.name);
                }}
                className="p-2 xs:p-3 bg-white rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-lg"
                aria-label="Download"
                title="Download"
              >
                <Download className="w-5 h-5 xs:w-6 xs:h-6" />
              </button>
              <button
                onClick={() => setViewerImage(null)}
                className="p-2 xs:p-3 bg-white rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"
                aria-label="Close"
                title="Close"
              >
                <X className="w-5 h-5 xs:w-6 xs:h-6" />
              </button>
            </div>
            <img
              src={viewerImage.url}
              alt={viewerImage.name}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 xs:bottom-6 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full">
              <span className="text-white text-sm xs:text-base font-medium">{viewerImage.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
