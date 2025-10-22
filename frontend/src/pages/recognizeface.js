import React, { useState } from 'react';
import { Camera, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

function RecognizeTab({ onRecognize, loading }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setUploadedImageUrl(url);
      setResult(null); // Clear previous result
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append("file", file); // <-- send the actual file
      formData.append("name", "John");      // replace with your form state
      formData.append("fullName", "John Doe");
      formData.append("age", 30);
      formData.append("gender", "Male");
      formData.append("crime", "Theft");
      formData.append("description", "Test");
      formData.append("status", "active");
  
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
      const data = await response.json();
      setResult(data.data); // save backend response
    } catch (err) {
      console.error("Recognition error:", err);
    }
  };
  

  const getAccuracyColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyIcon = (score) => {
    if (score >= 0.8) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 0.6) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Recognize Face</h2>
      
      {!file ? (
        // Initial upload state
        <form className="space-y-6">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
              Face Image to Recognize
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        </form>
      ) : !result ? (
        // After file is selected but before recognition - show image preview and recognize button
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Selected Image</h3>
            <div className="relative inline-block">
              {uploadedImageUrl && (
                <img
                  src={uploadedImageUrl}
                  alt="Selected face"
                  className="w-32 h-32 rounded-xl object-cover shadow-lg border-2 border-blue-200"
                />
              )}
            </div>
            <p className="mt-2 text-sm text-gray-600">File: {file.name}</p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Recognizing...' : 'Recognize Face'}
            </button>
            
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setUploadedImageUrl(null);
                // Reset the file input
                const fileInput = document.getElementById('file');
                if (fileInput) fileInput.value = '';
              }}
              className="flex-1 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // After recognition - show only the result (no buttons)
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recognition Complete</h3>
          <div className="relative inline-block">
            {uploadedImageUrl && (
              <img
                src={uploadedImageUrl}
                alt="Processed face"
                className="w-32 h-32 rounded-xl object-cover shadow-lg border-2 border-blue-200"
              />
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">Face has been processed</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Recognition Result</h3>
            <p className="text-gray-600">Face comparison analysis</p>
          </div>

          {/* Image Comparison */}
          <div className="flex justify-center items-center space-x-16 mb-6">
            {/* Uploaded Image */}
            <div className="text-center">
              <div className="relative">
                {uploadedImageUrl && (
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="w-48 h-48 rounded-2xl object-cover border-4 border-blue-300 shadow-xl"
                  />
                )}
                <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  IN
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="text-gray-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            {/* Matched Image */}
            <div className="text-center">
              <div className="relative">
                {result.matched_image_id ? (
                  <img
                    src={`http://localhost:5000/api/image/${result.matched_image_id}`}
                    alt="Matched"
                    className="w-48 h-48 rounded-2xl object-cover border-4 border-green-300 shadow-xl"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-gray-200 flex items-center justify-center border-4 border-gray-300 shadow-xl">
                    <User className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  MATCH
                </div>
              </div>
            </div>
          </div>

          {/* Minimal Criminal Info */}
          {result.recognized && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-3 mb-3">
                {result.matched_image_id ? (
                  <img
                    src={`http://localhost:5000/api/image/${result.matched_image_id}`}
                    alt="Criminal"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-semibold text-gray-900">{result.best_name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    result.status === 'wanted' ? 'bg-red-100 text-red-800' :
                    result.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.status === 'wanted' ? 'Wanted' :
                     result.status === 'active' ? 'Active' :
                     result.status === 'inactive' ? 'Inactive' : 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Age:</span>
                  <span className="font-medium">{result.age && result.age !== 'N/A' ? `${result.age} years` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span className="font-medium">{result.gender && result.gender !== 'N/A' ? result.gender : 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crime:</span>
                  <span className="font-medium text-red-600">{result.crime && result.crime !== 'N/A' ? result.crime : 'Not specified'}</span>
                </div>
                {result.description && result.description !== 'Legacy record - no criminal data available' && (
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-600 text-xs">Description:</span>
                    <p className="text-gray-700 text-xs mt-1">{result.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accuracy Display */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-4 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              {getAccuracyIcon(result.best_score)}
              <div>
                <div className="text-sm font-medium text-gray-600">Recognition Accuracy</div>
                <div className={`text-3xl font-bold ${getAccuracyColor(result.best_score)}`}>
                  {(result.best_score * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div className="mt-6 text-center">
            {result.recognized ? (
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-800 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Match Found: {result.best_name}</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 bg-red-50 text-red-800 px-4 py-2 rounded-full">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">No Match Found</span>
              </div>
            )}
          </div>

          {/* Confidence Bar */}
          <div className="mt-6">
            <div className="text-center mb-2">
              <span className="text-sm font-medium text-gray-600">Confidence Level</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${
                  result.best_score >= 0.8 ? 'bg-green-500' :
                  result.best_score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.best_score * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Check Another Criminal Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setUploadedImageUrl(null);
                // Reset the file input
                const fileInput = document.getElementById('file');
                if (fileInput) fileInput.value = '';
              }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <Camera className="h-5 w-5 mr-2" />
              Check Another Criminal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecognizeTab;
