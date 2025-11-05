/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { RecognitionResult } from "./types";
import { Upload, RotateCcw, PenTool, Target, CheckCircle, Eye, Zap, ArrowRight } from "lucide-react";
import { apiClient } from "./lib/api";

const RecognizeFace: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Initializing...");

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

    try {
      const res = await apiClient.directUploadFile<RecognitionResult>("/recognize_face", formData);
      
      // Complete the loading animation
      clearInterval(textInterval);
      setLoadingText("Analysis complete!");
      
      // Small delay before showing result
      setTimeout(() => {
        setResult(res);
        setIsProcessing(false);
      }, 500);
      
    } catch (err: any) {
      clearInterval(textInterval);
      setLoadingText("Analysis failed");
      
      setTimeout(() => {
        setResult({ 
          status: "error", 
          message: err?.response?.data?.detail || err?.message || "Recognition failed"
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
  };

  const handleNewSketch = () => {
    navigate('/sketch');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-sm xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto px-3 xs:px-4 sm:px-5 md:px-6 py-6 xs:py-8 sm:py-10 md:py-12">
        
        {/* Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 xs:w-18 sm:w-20 h-16 xs:h-18 sm:h-20 bg-gray-900 rounded-2xl mb-4 xs:mb-5">
            <Eye className="w-8 xs:w-9 sm:w-10 h-8 xs:h-9 sm:h-10 text-white" />
          </div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 mb-2 xs:mb-3">
            Face Recognition
          </h1>
          <p className="text-sm xs:text-base text-gray-600 max-w-md mx-auto">
            Upload facial image to identify suspects
          </p>
        </div>

 {/* Don't Have Image Section */}
 {!file && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 xs:p-7 sm:p-8 mb-8 xs:mb-10 sm:mb-12">
            <div className="text-center">
              <div className="w-12 xs:w-14 h-12 xs:h-14 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-6 xs:w-7 h-6 xs:h-7 text-white" />
              </div>
              <h3 className="text-base xs:text-lg font-semibold text-gray-900 mb-2">No Image?</h3>
              <p className="text-sm text-gray-600 mb-4">Create a facial sketch instead</p>
              <button 
                onClick={handleNewSketch}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-xl transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <PenTool className="w-4 h-4" />
                <span>Create Sketch</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 xs:p-7 sm:p-8 mb-8 xs:mb-10 sm:mb-12">
          <div className="text-center mb-6 xs:mb-7">
            <h2 className="text-lg xs:text-xl font-semibold text-gray-900 mb-2">Upload Image</h2>
            <p className="text-xs xs:text-sm text-gray-500">Drag & drop or click to browse</p>
          </div>
          
          <div className="relative">
            {/* State 1: No file uploaded - Show upload dropzone */}
            {!file && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 xs:p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer group">
                <input 
                  type="file" 
                  id="recognize-file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Upload image file"
                  title="Upload image file"
                />
                
                <div className="space-y-4">
                  <div className="w-12 xs:w-14 h-12 xs:h-14 bg-gray-200 rounded-xl flex items-center justify-center mx-auto group-hover:bg-gray-300 transition-colors">
                    <Upload className="w-6 xs:w-7 h-6 xs:h-7 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm xs:text-base font-medium text-gray-900 mb-1">
                      Choose Image
                    </h3>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, JPEG • Max 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* State 2: File uploaded, no result - Show image preview with animation */}
            {file && !result && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="relative border border-gray-100 rounded-lg overflow-hidden mx-auto max-w-xs">
                  {objectUrl && (
                    <div className="relative">
                      <img 
                        src={objectUrl}
                        alt="Uploaded"
                        className={`w-full h-64 object-cover transition-all duration-500 ${
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
              <div className="bg-white border border-gray-200 rounded-xl p-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 lg:gap-8">
                  {/* Uploaded Image */}
                  <div className="flex-shrink-0 text-center">
                    <img
                      src={objectUrl || ''}
                      alt="Uploaded"
                      className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-lg object-cover border-2 border-gray-300"
                    />
                    <p className="text-sm text-gray-600 text-center mt-2 font-medium">Uploaded Image</p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-gray-400" />
                  </div>
                  
                  {/* Result Image */}
                  <div className="flex-shrink-0 text-center">
                    {result.status === 'recognized' ? (
                      <>
                        <img
                          src={result.image_url || ''}
                          alt={result.name || 'Match'}
                          className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-lg object-cover border-2 border-green-400"
                        />
                        <p className="text-sm text-green-600 text-center mt-2 font-medium">Database Match</p>
                      </>
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-lg bg-red-50 border-2 border-red-300 flex items-center justify-center">
                        <span className="text-red-500 text-lg font-medium">No Match</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                {result.status === 'recognized' && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <h2 className="text-lg font-bold text-gray-900 sm:col-span-2 mb-3">Match Details</h2>
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-500 font-medium">Name</span>
                      <span className="font-semibold text-gray-900 truncate ml-2">{result.name}</span>
                    </div>
                    {result.age && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-500 font-medium">Age</span>
                        <span className="font-semibold text-gray-900 ml-2">{result.age}</span>
                      </div>
                    )}
                    {result.crime && (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-500 font-medium">Crime</span>
                        <span className="font-semibold text-gray-900 ml-2 truncate">{result.crime}</span>
                      </div>
                    )}
                    {result.description && (
                      <div className="sm:col-span-2 bg-gray-50 rounded-lg px-3 py-2">
                        <div className="text-gray-500 font-medium mb-1">Description</div>
                        <div className="text-gray-800 text-sm line-clamp-3">{result.description}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 xs:mt-7 text-center">
            {file && !result && (
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={handleReset}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset</span>
                </button>
                <button 
                  onClick={handleRecognize}
                  disabled={isProcessing}
                  className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="animate-pulse">{loadingText}</span>
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
          <div className="mt-6">
            {/* Context-aware button section */}
            <div className="text-center mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                {result.status === 'recognized' 
                  ? "✓ Match Found! What's next?" 
                  : "No match found. Try these options:"
                }
              </h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Primary Action - Context dependent */}
              {result.status === 'recognized' ? (
                // When match found - Show "View Details" or "Add to Case"
                <button 
                  onClick={() => {
                    // Could navigate to detailed criminal profile or add to case
                    alert(`Viewing detailed profile for ${result.name}`);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <Target className="w-4 h-4" />
                  <span>View Full Profile</span>
                </button>
              ) : (
                // When no match - Show "Create Sketch" as primary action
                <button 
                  onClick={handleNewSketch}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Create Sketch</span>
                </button>
              )}
              
              {/* Secondary Action - Always relevant */}
              <button 
                onClick={() => {
                  // Navigate to add suspect page to add this person
                  navigate('/add');
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>{result.status === 'recognized' ? 'Update Record' : 'Add to Database'}</span>
              </button>
              
              {/* Tertiary Action - Reset for new search */}
              <button 
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>New Search</span>
              </button>
            </div>
            
            {/* Additional context message */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {result.status === 'recognized' 
                  ? `Confidence: ${((result.similarity || 0) * 100).toFixed(1)}% • Ready for investigation`
                  : "Try creating a sketch or adding this person to the database"
                }
              </p>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 xs:p-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Quick Tips</h3>
            </div>
            <ul className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Use clear, well-lit images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Front-facing photos work best</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 font-bold">•</span>
                <span>Avoid hats, masks, or obstructions</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecognizeFace;