/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  Edit, 
  Eye, 
  Search, 
  Filter,
  User,
  Calendar,
  AlertTriangle,
  Shield,
  UserX,
  Save,
  X,
  Plus,
  MoreVertical,
  FileText,
  UserCheck,
  Clock
} from 'lucide-react';
import { criminalAPI } from '../services/api';
import CriminalTable from '../components/criminaldBtable';

const CriminalDatabase = () => {
  const [criminals, setCriminals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCriminal, setSelectedCriminal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCriminal, setEditingCriminal] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editForm, setEditForm] = useState({
    full_name: '',
    age: '',
    gender: '',
    crime: '',
    description: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCriminals();
  }, []);

  const showMessage = (msg, type = 'info') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const fetchCriminals = async () => {
    setLoading(true);
    try {
      const data = await criminalAPI.getAllCriminals();
      console.log('Fetched criminals data:', data);
      setCriminals(data);
    } catch (error) {
      console.error('Error fetching criminals:', error);
      showMessage('Failed to fetch criminal database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    
    setLoading(true);
    try {
      await criminalAPI.deleteCriminal(name);
      showMessage(`${name} deleted successfully`, 'success');
      fetchCriminals();
    } catch (error) {
      showMessage(error.response?.data?.detail || 'Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (criminal) => {
    setSelectedCriminal(criminal);
    setShowModal(true);
  };

  const handleEdit = (criminal) => {
    setEditingCriminal(criminal);
    setEditForm({
      full_name: criminal.full_name || criminal.name || '',
      age: criminal.age || '',
      gender: criminal.gender || '',
      crime: criminal.crime || '',
      description: criminal.description || '',
      status: criminal.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCriminal) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('full_name', editForm.full_name);
      formData.append('age', editForm.age);
      formData.append('gender', editForm.gender);
      formData.append('crime', editForm.crime);
      formData.append('description', editForm.description);
      formData.append('status', editForm.status);

      await criminalAPI.updateCriminal(editingCriminal.name, formData);
      showMessage('Criminal record updated successfully', 'success');
      setShowEditModal(false);
      setEditingCriminal(null);
      fetchCriminals();
    } catch (error) {
      showMessage(error.response?.data?.detail || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setEditingCriminal(null);
    setEditForm({
      full_name: '',
      age: '',
      gender: '',
      crime: '',
      description: '',
      status: 'active'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'wanted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <AlertTriangle className="h-4 w-4" />;
      case 'inactive':
        return <UserX className="h-4 w-4" />;
      case 'wanted':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mr-4">
                <Database className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Criminal Database</h1>
                <p className="text-red-100 text-sm">Advanced face recognition & criminal management system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-lg px-4 py-2">
                <div className="text-white text-sm font-medium">Total Records</div>
                <div className="text-2xl font-bold text-white">{criminals.length}</div>
              </div>
              <button
                onClick={fetchCriminals}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-white rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors duration-200"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`p-4 rounded-md ${
            messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            messageType === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <span>{message}</span>
          </div>
        </div>
      )}

      {/* Info Banner */}
      {criminals.some(c => c.description && c.description.includes('Legacy record')) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Legacy Records Detected
                </h3>
                <div className="mt-2 text-sm text-orange-700">
                  <p>
                    Some records were created before the criminal database features were added. 
                    These records show "N/A" for criminal data fields. To add criminal information, 
                    you can register a new record with the same name.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, crime, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white min-w-[140px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="wanted">Wanted</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Criminal Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <CriminalTable
          criminals={criminals}
          loading={loading}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onViewDetails={handleViewDetails}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
        />
      </div>

      {/* Detail Modal */}
      {showModal && selectedCriminal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-t-2xl p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Criminal Details</h3>
                    <p className="text-red-100">Complete information about this record</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              
              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  {selectedCriminal.image_id ? (
                    <img
                      className="h-24 w-24 rounded-2xl object-cover shadow-lg border-4 border-gray-200"
                      src={criminalAPI.getImage(selectedCriminal.image_id)}
                      alt={selectedCriminal.full_name || selectedCriminal.name}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border-4 border-gray-200">
                      <User className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900">{selectedCriminal.full_name || selectedCriminal.name || 'Unknown'}</h4>
                    {selectedCriminal.full_name && selectedCriminal.name && (
                      <p className="text-lg text-gray-600 font-medium">{selectedCriminal.name}</p>
                    )}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedCriminal.status || 'Unknown')}`}>
                        {getStatusIcon(selectedCriminal.status || 'Unknown')}
                        <span className="ml-2">{selectedCriminal.status || 'Unknown'}</span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Age</label>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {selectedCriminal.age === 'N/A' ? (
                        <span className="text-gray-400 italic">Not specified</span>
                      ) : (
                        <span className="text-blue-600">{selectedCriminal.age} years old</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Gender</label>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {selectedCriminal.gender === 'N/A' ? (
                        <span className="text-gray-400 italic">Not specified</span>
                      ) : (
                        <span className="text-green-600">{selectedCriminal.gender}</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Crime Committed</label>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {selectedCriminal.crime === 'N/A' ? (
                        <span className="text-gray-400 italic">Not specified</span>
                      ) : (
                        <span className="text-red-600">{selectedCriminal.crime}</span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                    <p className="text-lg text-gray-900 mt-1 leading-relaxed">
                      {selectedCriminal.description || 'No additional description provided'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => handleEdit(selectedCriminal)}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
                >
                  <Edit className="h-5 w-5 mr-2" />
                  Edit Record
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingCriminal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
            <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-t-2xl p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Edit Criminal Record</h3>
                    <p className="text-green-100">Update information for {editingCriminal.full_name || editingCriminal.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleEditCancel}
                  className="text-white hover:text-green-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age *
                    </label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({...editForm, age: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender *
                    </label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="wanted">Wanted</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Crime Committed *
                    </label>
                    <input
                      type="text"
                      value={editForm.crime}
                      onChange={(e) => setEditForm({...editForm, crime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                      rows="4"
                      placeholder="Enter additional details about the criminal..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default CriminalDatabase;
