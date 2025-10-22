/*eslint-disable*/
import React, { useState } from 'react';
import { Upload } from 'lucide-react';

// Register Tab Component
function RegisterTab({ onRegister, loading }) {
    const [name, setName] = useState('');
    const [fullName, setFullName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [crime, setCrime] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('active');
    const [file, setFile] = useState(null);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name || !file || !fullName || !age || !gender || !crime || !status) {
        console.log('Form validation failed:', { name, file: !!file, fullName, age, gender, crime, status });
        return;
      }
      console.log('Form data being sent:', { name, fullName, age, gender, crime, description, status });
      onRegister({ 
        name, 
        file, 
        full_name: fullName,
        age: parseInt(age),
        gender,
        crime,
        description,
        status
      });
      setName('');
      setFullName('');
      setAge('');
      setGender('');
      setCrime('');
      setDescription('');
      setStatus('active');
      setFile(null);
    };
  


    return (
      <div className="bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
          <div className="px-4 lg:px-8 py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Register New Criminal</h1>
                <p className="text-gray-300">Add a new criminal profile to the database</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700/50 p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Short Name (ID)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter short name/ID"
                required
              />
            </div>
            
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-white mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter age"
                min="1"
                max="120"
                required
              />
            </div>
            
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-white mb-2">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="crime" className="block text-sm font-medium text-white mb-2">
                Crime
              </label>
              <input
                type="text"
                id="crime"
                value={crime}
                onChange={(e) => setCrime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter crime committed"
                required
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="wanted">Wanted</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter additional details about the criminal"
              rows="3"
            />
          </div>
          
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-white mb-2">
              Face Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-lg hover:border-red-500 transition-colors bg-gray-700/30">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-300">
                  <label
                    htmlFor="file"
                    className="relative cursor-pointer bg-red-500 hover:bg-red-600 rounded-lg px-4 py-2 font-medium text-white transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-red-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files[0])}
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading || !name || !file || !fullName || !age || !gender || !crime || !status}
            className="w-full flex justify-center py-3 px-6 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Registering...' : 'Register Criminal'}
          </button>
        </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  export default RegisterTab;
