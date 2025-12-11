/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { RecognitionResult } from "./types";
import { Upload, RotateCcw, PenTool, Target, CheckCircle, Eye, Zap, ArrowRight, Maximize2, Download, X } from "lucide-react";
import { apiClient } from "./lib/api";

const RecognizeFace: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Initializing...");
  const [isResultFullscreen, setIsResultFullscreen] = useState<boolean>(false);
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string>("");
  const [isSketch, setIsSketch] = useState<boolean>(false);

  const forensicFacts = [
    "Analyzing facial geometry...",
    "Extracting biometric features...",
    "Comparing against database...",
    "Calculating similarity scores...",
    "Cross-referencing criminal records...",
    "Validating match confidence...",
    "Generating final report..."
  ];

  // Create/revoke object URL for uploaded image
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setObjectUrl(null);
    }
  }, [file]);

  const handleRecognize = async (): Promise<void> => {
    if (!file) return;

    setIsProcessing(true);
    setLoadingText("Initializing...");

    // Update loading text based on progress
    const textInterval = setInterval(() => {
      const factIndex = Math.floor(Math.random() * forensicFacts.length);
      setLoadingText(forensicFacts[factIndex]);
    }, 600);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("is_sketch", isSketch.toString());

    try {
      const res = await apiClient.directUploadFile<RecognitionResult>("/recognize_face", formData);
      
      // Complete the loading animation
      clearInterval(textInterval);
      
      // Check if the response indicates an error (even if HTTP status is 200)
      if (res.status === "error") {
        setLoadingText("Analysis failed");
        setTimeout(() => {
          setResult({ 
            status: "error", 
            message: res.message || "Recognition failed. Please try a different image or ensure the image contains a clear face."
          });
          setIsProcessing(false);
        }, 500);
        return;
      }
      
      setLoadingText("Analysis complete!");
      
      // Small delay before showing result
      setTimeout(() => {
        setResult(res);
        setIsProcessing(false);
      }, 500);
      
    } catch (err: any) {
      clearInterval(textInterval);
      setLoadingText("Analysis failed");
      
      // Handle HTTP errors (4xx, 5xx) and network errors
      const errorMessage = err?.response?.data?.detail || 
                           err?.response?.data?.message || 
                           err?.message || 
                           "Recognition failed. Please ensure the image is valid and try again.";
      
      setTimeout(() => {
        setResult({ 
          status: "error", 
          message: errorMessage
        });
        setIsProcessing(false);
      }, 500);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setIsProcessing(false);
    setLoadingText("Initializing...");
    setIsResultFullscreen(false);
    setFullscreenImageUrl("");
    setIsSketch(false);
  };

  const openFullscreen = (imageUrl: string) => {
    if (imageUrl) {
      setFullscreenImageUrl(imageUrl);
      setIsResultFullscreen(true);
    }
  };

  const closeFullscreen = () => {
    setIsResultFullscreen(false);
    setFullscreenImageUrl("");
  };

  const handleNewSketch = () => {
    navigate('/sketch');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-5 lg:py-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="mt-0.5 sm:mt-1 inline-flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg text-white flex-shrink-0">
              <Eye className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-slate-900">
                Face Recognition
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1 sm:mt-1.5">
                Upload facial image to identify suspects from the criminal database using advanced AI recognition.
              </p>
            </div>
          </div>
        </div>

        {/* Don't Have Image Section */}
        {!file && (
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <PenTool className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-slate-900 mb-1.5 sm:mb-2">No Image?</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">Create a facial sketch instead</p>
              <button 
                onClick={handleNewSketch}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center gap-2 mx-auto text-sm sm:text-base shadow-lg"
              >
                <PenTool className="w-4 h-4" />
                <span>Create Sketch</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Upload Section */}
        <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm">
          <div className="text-center mb-4 sm:mb-5">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-1 sm:mb-2">Upload Image</h2>
            <p className="text-xs sm:text-sm text-slate-500">Drag & drop or click to browse</p>
          </div>
          
          <div className="relative">
            {/* State 1: No file uploaded - Show upload dropzone */}
            {!file && (
              <div className="border-2 border-dashed border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 text-center bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200 cursor-pointer group shadow-[0_2px_6px_rgba(0,0,0,0.06),0_0_0_1px_rgba(148,163,184,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(148,163,184,0.15)]">
                <input 
                  type="file" 
                  id="recognize-file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Upload image file"
                  title="Upload image file"
                />
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-sm">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-medium text-slate-900 mb-1">
                      Choose Image
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      JPG, PNG, JPEG • Max 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* State 2: File uploaded, no result - Show image preview with animation */}
            {file && !result && (
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                {/* Sketch detection checkbox */}
                <div className="mb-3 flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <input
                    type="checkbox"
                    id="is-sketch-checkbox"
                    checked={isSketch}
                    onChange={(e) => setIsSketch(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                  <label htmlFor="is-sketch-checkbox" className="text-xs sm:text-sm text-slate-700 cursor-pointer flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    <span>This is a sketch (uses lower recognition threshold)</span>
                  </label>
                </div>

                <div className="relative rounded-lg sm:rounded-xl overflow-hidden mx-auto max-w-xs sm:max-w-sm shadow-[0_2px_8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(148,163,184,0.12)]">
                  {objectUrl && (
                    <div className="relative">
                      <img 
                        src={objectUrl}
                        alt="Uploaded"
                        className={`w-full h-48 sm:h-56 md:h-64 object-cover transition-all duration-500 ${
                          isProcessing 
                            ? 'animate-pulse brightness-75 contrast-125 saturate-150' 
                            : ''
                        }`}
                      />
                      
                      {/* Magic Analysis Overlay */}
                      {isProcessing && (
                        <>
                          {/* Scanning Lines */}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-scan"></div>
                          
                          {/* Corner Brackets */}
                          <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-blue-500 animate-pulse"></div>
                          <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-blue-500 animate-pulse"></div>
                          <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-blue-500 animate-pulse"></div>
                          <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-blue-500 animate-pulse"></div>
                          
                          {/* Floating Analysis Points */}
                          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                          <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
                          
                          {/* Progress Text Overlay - Centered */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                              {loadingText}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* State 3: Result available - Show large comparison */}
            {file && result && (
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                  {/* Uploaded Image */}
                  <div className="flex-shrink-0 text-center">
                  <button
                          onClick={() => objectUrl && openFullscreen(objectUrl)}
                          className="mt-2 flex items-center justify-center gap-1.5 sm:gap-2 mx-auto px-2 sm:px-3 py-1 sm:py-1.50 text-emerald-700 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors duration-200 border min-w-[100px] sm:min-w-[120px] min-h-[32px] sm:min-h-[36px]"
                          aria-label="View fullscreen"
                        >
                    <img
                      src={objectUrl || ''}
                      alt="Uploaded"
                      className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg sm:rounded-xl object-cover border-2 border-slate-300 shadow-sm"
                    />
                    </button>
                    <p className="text-xs sm:text-sm text-slate-600 text-center mt-2 font-medium">Uploaded Image</p>
                    <button
                          onClick={() => objectUrl && openFullscreen(objectUrl)}
                          className="mt-2 flex items-center justify-center gap-1.5 sm:gap-2 mx-auto px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors duration-200 border border-emerald-200 hover:border-emerald-300 min-w-[100px] sm:min-w-[120px] min-h-[32px] sm:min-h-[36px]"
                          aria-label="View fullscreen"
                        >
                          <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>View Fullscreen</span>
                        </button>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-amber-500" />
                  </div>
                  
                  {/* Result Image */}
                  <div className="flex-shrink-0 text-center">
                    {result.status === 'recognized' ? (
                      <>
                        <button
                          onClick={() => result.image_url && openFullscreen(result.image_url)}
                          className="relative group cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-lg sm:rounded-xl transition-transform hover:scale-105 active:scale-95"
                          aria-label="View image in fullscreen"
                        >
                          <img
                            src={result.image_url || ''}
                            alt={result.name || 'Match'}
                            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg sm:rounded-xl object-cover border-2 border-emerald-400 shadow-sm"
                          />
                        </button>
                        <p className="text-xs sm:text-sm text-emerald-600 text-center mt-2 font-medium">Database Match</p>
                        <button
                          onClick={() => result.image_url && openFullscreen(result.image_url)}
                          className="mt-2 flex items-center justify-center gap-1.5 sm:gap-2 mx-auto px-2 sm:px-3 py-1 sm:py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-colors duration-200 border border-emerald-200 hover:border-emerald-300 min-w-[100px] sm:min-w-[120px] min-h-[32px] sm:min-h-[36px]"
                          aria-label="View fullscreen"
                        >
                          <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>View Fullscreen</span>
                        </button>
                      </>
                    ) : result.status === 'error' ? (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg sm:rounded-xl bg-amber-50 border-2 border-amber-300 flex flex-col items-center justify-center p-2">
                        <span className="text-amber-600 text-xs sm:text-sm md:text-base font-medium text-center">Error</span>
                        {result.message && (
                          <span className="text-amber-500 text-xs text-center mt-1">
                            {String(result.message).substring(0, 30)}
                            {String(result.message).length > 30 ? '...' : ''}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-lg sm:rounded-xl bg-red-50 border-2 border-red-300 flex flex-col items-center justify-center p-2">
                        <span className="text-red-500 text-sm sm:text-base md:text-lg font-medium">No Match</span>
                        {result.best_score !== undefined && (
                          <span className="text-red-400 text-xs mt-1">
                            Score: {(result.best_score * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                {result.status === 'recognized' && (
                  <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 sm:col-span-2 mb-2 sm:mb-3">Match Details</h2>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_0_0_1px_rgba(148,163,184,0.08)]">
                      <span className="text-xs sm:text-sm text-slate-500 font-medium">Name</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate ml-2">{result.name}</span>
                    </div>
                    {result.age && (
                      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_0_0_1px_rgba(148,163,184,0.08)]">
                        <span className="text-xs sm:text-sm text-slate-500 font-medium">Age</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 ml-2">{result.age}</span>
                      </div>
                    )}
                    {result.crime && (
                      <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_0_0_1px_rgba(148,163,184,0.08)]">
                        <span className="text-xs sm:text-sm text-slate-500 font-medium">Crime</span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 ml-2 truncate">{result.crime}</span>
                      </div>
                    )}
                    {result.description && (
                      <div className="sm:col-span-2 bg-slate-50 rounded-lg px-3 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_0_0_1px_rgba(148,163,184,0.08)]">
                        <div className="text-xs sm:text-sm text-slate-500 font-medium mb-1">Description</div>
                        <div className="text-xs sm:text-sm text-slate-800 line-clamp-3">{result.description}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-5 md:mt-6 text-center">
            {file && !result && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                <button 
                  onClick={handleReset}
                  className="bg-slate-500 hover:bg-slate-600 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button 
                  onClick={handleRecognize}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="animate-pulse text-xs sm:text-sm">{loadingText}</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      <span>Recognize Face</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Smart Action buttons for result */}
        {result && !isProcessing && (
          <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
            {/* Context-aware button section */}
            <div className="text-center mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                {result.status === 'recognized' 
                  ? "✓ Match Found! What's next?" 
                  : result.status === 'error'
                  ? "⚠ Processing Error - Try Again"
                  : "No match found. Try these options:"
                }
              </h3>
              {result.status === 'error' && result.message && (
                <p className="text-xs text-amber-600 mt-1">{String(result.message)}</p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              {/* Primary Action - Context dependent */}
              {result.status === 'recognized' ? (
                <button 
                  onClick={() => {
                    alert(`Viewing detailed profile for ${result.name}`);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95 shadow-lg"
                >
                  <Target className="w-4 h-4" />
                  <span>View Full Profile</span>
                </button>
              ) : (
                <button 
                  onClick={handleNewSketch}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95 shadow-lg"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Create Sketch</span>
                </button>
              )}
              
              {/* Secondary Action - Always relevant */}
              <button 
                onClick={() => {
                  navigate('/add');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                <span>{result.status === 'recognized' ? 'Update Record' : 'Add to Database'}</span>
              </button>
              
              {/* Tertiary Action - Reset for new search */}
              <button 
                onClick={handleReset}
                className="bg-slate-500 hover:bg-slate-600 text-white font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Search</span>
              </button>
            </div>
            
            {/* Additional context message */}
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs sm:text-sm text-slate-500">
                {result.status === 'recognized' 
                  ? `Confidence: ${((result.similarity || 0) * 100).toFixed(1)}% • Ready for investigation`
                  : result.status === 'error'
                  ? "If the error persists, try using a different image format or ensure the image contains a clear face"
                  : result.best_score !== undefined
                  ? `Best match score: ${(result.best_score * 100).toFixed(1)}% (below threshold). Try creating a sketch or adding this person to the database`
                  : "Try creating a sketch or adding this person to the database"
                }
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">Quick Tips</h3>
          </div>
          <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold flex-shrink-0">•</span>
              <span>Use clear, well-lit images</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold flex-shrink-0">•</span>
              <span>Front-facing photos work best</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold flex-shrink-0">•</span>
              <span>Avoid hats, masks, or obstructions</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Fullscreen Result Image Overlay */}
      {isResultFullscreen && fullscreenImageUrl && (
        <div 
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeFullscreen}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen image viewer"
        >
          {/* Close Button - Top Right */}
          <button
            onClick={closeFullscreen}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 backdrop-blur-sm border border-white/20 min-w-[40px] sm:min-w-[48px] min-h-[40px] sm:min-h-[48px]"
            aria-label="Close fullscreen"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Image Container */}
          <div 
            className="flex-1 flex items-center justify-center w-full p-2 sm:p-4 md:p-6 lg:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={fullscreenImageUrl}
              alt="Fullscreen result"
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Action Buttons - Bottom */}
          <div 
            className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-2 sm:gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <a
              href={fullscreenImageUrl}
              download
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base min-w-[120px] sm:min-w-[140px] min-h-[40px] sm:min-h-[44px] shadow-lg"
              aria-label="Download image"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Download</span>
            </a>
            <button
              onClick={closeFullscreen}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base min-w-[120px] sm:min-w-[140px] min-h-[40px] sm:min-h-[44px] shadow-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecognizeFace;