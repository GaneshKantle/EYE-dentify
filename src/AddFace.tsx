/*eslint-disable*/
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, Upload, Shield, CheckCircle, Database } from "lucide-react";
import Toast from "./Toast";
import { apiClient } from "./lib/api";

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

const AddFace: React.FC = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3 sm:py-4 md:py-5 lg:py-6 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="mt-0.5 sm:mt-1 inline-flex h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg text-white flex-shrink-0">
              <UserPlus className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-slate-900">
                Add Suspect
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mt-1 sm:mt-1.5">
                Add new criminal records to the database with complete information for investigation purposes.
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/gallery')}
              className="mt-0.5 sm:mt-1 flex-shrink-0 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-1.5 sm:gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Database</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-sm space-y-3 sm:space-y-4"
        >
          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            
            {/* Name Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-slate-700">
                Full Name *
              </label>
              <input 
                type="text" 
                id="name"
                placeholder="Enter suspect's name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 text-sm"
                required
              />
            </div>
            
            {/* Age Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="age" className="block text-xs sm:text-sm font-semibold text-slate-700">
                Age
              </label>
              <input 
                type="number" 
                id="age"
                placeholder="Age" 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 text-sm"
              />
            </div>
            
            {/* Crime Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="crime" className="block text-xs sm:text-sm font-semibold text-slate-700">
                Crime Type
              </label>
              <input 
                type="text" 
                id="crime"
                placeholder="e.g., Theft, Assault" 
                value={crime} 
                onChange={(e) => setCrime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 text-sm"
              />
            </div>
            
            {/* Description Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label htmlFor="description" className="block text-xs sm:text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea 
                id="description"
                placeholder="Physical description, aliases, additional details..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 resize-none text-sm"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mt-3 sm:mt-4">
            <label htmlFor="file-input" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
              Photo *
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-[0_2px_6px_rgba(0,0,0,0.06),0_0_0_1px_rgba(148,163,184,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(148,163,184,0.15)]">
              <input 
                type="file" 
                id="file-input"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-slate-700 mb-1">
                      Upload Photo
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Click to browse or drag and drop
                    </p>
                  </div>
                  {file && (
                    <div className="mt-3 sm:mt-4">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="max-w-32 sm:max-w-40 md:max-w-48 max-h-32 sm:max-h-40 md:max-h-48 mx-auto rounded-lg object-contain shadow-[0_2px_8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(148,163,184,0.12)]"
                      />
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 truncate max-w-xs mx-auto">{file.name}</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Upload Button */}
          <div className="mt-4 sm:mt-5">
            <motion.button 
              type="button" 
              onClick={handleUpload}
              disabled={isUploading || !file || !name}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base shadow-lg flex items-center justify-center gap-2"
              whileHover={{ scale: isUploading || !file || !name ? 1 : 1.02 }}
              whileTap={{ scale: isUploading || !file || !name ? 1 : 0.98 }}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Add to Database</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Guidelines Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(148,163,184,0.1)]"
        >
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            Guidelines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {[
              "High-quality photos",
              "Front-facing preferred", 
              "Good lighting",
              "Complete information"
            ].map((guideline, index) => (
              <div key={index} className="flex items-center text-xs sm:text-sm text-slate-600">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2 flex-shrink-0" />
                <span>{guideline}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AddFace;
