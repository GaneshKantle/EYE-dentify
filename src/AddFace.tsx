/*eslint-disable*/
import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Upload, Shield, CheckCircle } from "lucide-react";
import Toast from "./Toast";
import Header from "./pages/dashboard/Header";
import { Footer } from "./pages/dashboard/Footer";
import { apiClient } from "./lib/api";

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const AddFace: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [crime, setCrime] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUpload = async (): Promise<void> => {
    if (!file || !name) {
      setToast({ message: "Name and file are required!", type: "error" });
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("age", age);
    formData.append("crime", crime);
    formData.append("description", description);

    try {
      const data = await apiClient.directUploadFile<{status: string, message: string}>("/add_face", formData);
        setToast({ message: data.message, type: "success" });
        // Reset form
        setName("");
        setAge("");
        setCrime("");
        setDescription("");
        setFile(null);
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setToast({ message: err?.response?.data?.detail || err?.message || "Network error", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.03)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,69,19,0.03)_0%,transparent_50%),linear-gradient(45deg,transparent_40%,rgba(239,68,68,0.02)_50%,transparent_60%)] bg-[length:100%_100%,100%_100%,200px_200px]" />
      </div>

      {/* Border Accents */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-50" />

      {/* Header */}

      {/* Main Content */}
      <div className="relative z-10 px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 3xl:px-20 py-4 xs:py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 2xl:py-20 3xl:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Compact Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-3 xs:mb-4 sm:mb-5 md:mb-6"
          >
            <div className="flex items-center justify-center mb-1 xs:mb-2">
              <div className="w-6 xs:w-8 sm:w-10 h-6 xs:h-8 sm:h-10 bg-gray-800 rounded-md flex items-center justify-center shadow-sm mr-2">
                <UserPlus className="w-3 xs:w-4 sm:w-5 h-3 xs:h-4 sm:h-5 text-white" />
              </div>
              <h1 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
                Add Suspect
              </h1>
            </div>
            <div className="w-12 xs:w-16 sm:w-20 md:w-24 lg:w-28 h-0.5 xs:h-1 bg-gray-800/80 mx-auto rounded-full" />
          </motion.div>

          {/* Ultra-Compact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white backdrop-blur-sm rounded-md border border-gray-200 shadow-sm p-3 xs:p-4 sm:p-5"
          >
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs xs:text-sm font-semibold text-gray-700">
                  Full Name *
                </label>
                <input 
                  type="text" 
                  id="name"
                  placeholder="Enter suspect's name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md px-2 xs:px-3 py-1.5 xs:py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-xs xs:text-sm"
                  required
                />
              </div>
              
              {/* Age Field */}
              <div className="space-y-2">
                <label htmlFor="age" className="block text-xs xs:text-sm font-semibold text-gray-700">
                  Age
                </label>
                <input 
                  type="number" 
                  id="age"
                  placeholder="Age" 
                  value={age} 
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md px-2 xs:px-3 py-1.5 xs:py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-xs xs:text-sm"
                />
              </div>
              
              {/* Crime Field */}
              <div className="space-y-2">
                <label htmlFor="crime" className="block text-xs xs:text-sm font-semibold text-gray-700">
                  Crime Type
                </label>
                <input 
                  type="text" 
                  id="crime"
                  placeholder="e.g., Theft, Assault" 
                  value={crime} 
                  onChange={(e) => setCrime(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md px-2 xs:px-3 py-1.5 xs:py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 text-xs xs:text-sm"
                />
              </div>
              
              {/* Description Field */}
              <div className="space-y-1 xs:col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-3 xl:col-span-3 2xl:col-span-3 3xl:col-span-3">
                <label htmlFor="description" className="block text-xs xs:text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea 
                  id="description"
                  placeholder="Physical description, aliases, additional details..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-white border border-gray-300 rounded-md px-2 xs:px-3 py-1.5 xs:py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent transition-all duration-200 resize-none text-xs xs:text-sm"
                />
              </div>
            </div>

            {/* Compact Photo Upload */}
            <div className="mt-2 xs:mt-3 sm:mt-4">
              <div className="border-2 border-dashed border-gray-300 rounded-md p-3 text-center hover:border-gray-400 hover:bg-gray-50 transition-all duration-200">
                <input 
                  type="file" 
                  id="file-input"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <div className="space-y-1 xs:space-y-2">
                    <div className="w-6 xs:w-8 sm:w-10 h-6 xs:h-8 sm:h-10 bg-gray-800 rounded-md flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="w-3 xs:w-4 sm:w-5 h-3 xs:h-4 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs xs:text-sm font-semibold text-gray-700 mb-0.5">
                        Upload Photo
                      </h3>
                      <p className="text-xs text-gray-500">
                        Click to browse
                      </p>
                    </div>
                    {file && (
                      <div className="mt-1 xs:mt-2">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="max-w-20 max-h-20 mx-auto rounded-md border border-gray-200 object-contain"
                        />
                        <p className="text-xs text-gray-600 mt-0.5 truncate max-w-24 xs:max-w-32">{file.name}</p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Compact Upload Button */}
            <div className="mt-2 xs:mt-3 sm:mt-4 text-center">
              <motion.button 
                type="button" 
                onClick={handleUpload}
                disabled={isUploading || !file || !name}
                className="bg-gray-800 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 sm:py-2.5 rounded-md transition-all duration-200 text-xs xs:text-sm shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isUploading ? (
                  <div className="flex items-center gap-1.5 xs:gap-2">
                    <div className="w-3 xs:w-4 h-3 xs:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 xs:gap-2">
                    <Shield className="w-3 xs:w-4 h-3 xs:h-4" />
                    <span>Add to Database</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Compact Guidelines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 xs:mt-3 sm:mt-4 md:mt-5"
          >
            <div className="bg-white backdrop-blur-sm rounded-md border border-gray-200 shadow-sm p-3 xs:p-4 sm:p-5">
              <h3 className="text-xs xs:text-sm font-bold text-gray-800 mb-1.5 xs:mb-2 flex items-center">
                <CheckCircle className="w-3 xs:w-4 h-3 xs:h-4 text-gray-700 mr-1" />
                Guidelines
              </h3>
              <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 3xl:grid-cols-4 gap-1 xs:gap-1.5 sm:gap-2">
                {[
                  "High-quality photos",
                  "Front-facing preferred", 
                  "Good lighting",
                  "Complete information"
                ].map((guideline, index) => (
                  <div key={index} className="flex items-center text-xs xs:text-sm text-gray-600">
                    <div className="w-1 xs:w-1.5 h-1 xs:h-1.5 bg-gray-500 rounded-full mr-1 flex-shrink-0" />
                    <span>{guideline}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
      
        </div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AddFace;
