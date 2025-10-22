import React, { useState } from 'react';
import { 
  Trash2, 
  Edit, 
  Eye, 
  User,
  Calendar,
  AlertTriangle,
  Shield,
  UserX,
  MoreVertical,
  FileText,
  UserCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { criminalAPI } from '../services/api';

const CriminalTable = ({ 
  criminals, 
  loading, 
  onDelete, 
  onEdit, 
  onViewDetails,
  searchTerm,
  statusFilter 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter criminals
  const filteredCriminals = criminals.filter(criminal => {
    const fullName = criminal.full_name || criminal.name || 'Unknown';
    const crime = criminal.crime || 'Unknown';
    const status = criminal.status || 'Unknown';
    
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         crime.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCriminals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCriminals = filteredCriminals.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

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

  const PaginationButton = ({ onClick, disabled, children, className = "" }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
          <span className="mt-4 text-gray-600 font-medium">Loading criminal database...</span>
        </div>
      </div>
    );
  }

  if (filteredCriminals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <User className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No criminal records found</h3>
        <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Photo</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Full Name</span>
                    <span className="sm:hidden">Name</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Age</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    <UserCheck className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Gender</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Crime</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Status</span>
                  </div>
                </th>
                <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center">
                    <MoreVertical className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentCriminals.map((criminal, index) => (
                <tr key={index} className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-200 group">
                  {/* Photo */}
                  <td className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                    <div className="flex-shrink-0 h-12 w-12 sm:h-16 sm:w-16">
                      {criminal.image_id ? (
                        <img
                          className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl object-cover shadow-lg border-2 border-gray-200"
                          src={criminalAPI.getImage(criminal.image_id)}
                          alt={criminal.full_name}
                        />
                      ) : (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg border-2 border-gray-200">
                          <User className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm sm:text-lg font-semibold text-gray-900 truncate max-w-[150px] sm:max-w-none">
                        {criminal.full_name || criminal.name || 'Unknown'}
                      </div>
                      {criminal.full_name && criminal.name && (
                        <div className="text-xs sm:text-sm text-gray-500 font-medium truncate max-w-[150px] sm:max-w-none">
                          {criminal.name}
                        </div>
                      )}
                      {criminal.description && criminal.description.includes('Legacy record') && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1 w-fit">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">Legacy Record</span>
                          <span className="sm:hidden">Legacy</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Age */}
                  <td className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">
                      {criminal.age === 'N/A' ? (
                        <span className="text-gray-400 italic font-normal text-xs sm:text-sm">N/A</span>
                      ) : (
                        <span className="bg-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          {criminal.age} years
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Gender */}
                  <td className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                    <div className="text-sm sm:text-lg font-semibold text-gray-900">
                      {criminal.gender === 'N/A' ? (
                        <span className="text-gray-400 italic font-normal text-xs sm:text-sm">N/A</span>
                      ) : (
                        <span className="bg-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          {criminal.gender}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Crime */}
                  <td className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                    <div className="max-w-[120px] sm:max-w-xs">
                      {criminal.crime === 'N/A' ? (
                        <span className="text-gray-400 italic font-normal text-xs sm:text-sm">N/A</span>
                      ) : (
                        <div className="bg-red-50 text-red-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium truncate">
                          {criminal.crime}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(criminal.status || 'Unknown')}`}>
                      {getStatusIcon(criminal.status || 'Unknown')}
                      <span className="ml-1 sm:ml-2 hidden sm:inline">{criminal.status || 'Unknown'}</span>
                      <span className="ml-1 sm:hidden">{criminal.status?.charAt(0) || 'U'}</span>
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 sm:px-6 py-4 sm:py-6 whitespace-nowrap">
                    <div className="flex items-center space-x-1 sm:space-x-3">
                      <button
                        onClick={() => onViewDetails(criminal)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => onEdit(criminal)}
                        className="p-1.5 sm:p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Edit Record"
                      >
                        <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                      <button
                        onClick={() => onDelete(criminal.name)}
                        className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Info */}
            <div className="text-sm text-gray-700">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(endIndex, filteredCriminals.length)}</span> of{' '}
              <span className="font-semibold">{filteredCriminals.length}</span> results
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <PaginationButton
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hidden sm:flex"
              >
                <ChevronsLeft className="h-4 w-4" />
              </PaginationButton>
              
              <PaginationButton
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </PaginationButton>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <PaginationButton
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </PaginationButton>
              
              <PaginationButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hidden sm:flex"
              >
                <ChevronsRight className="h-4 w-4" />
              </PaginationButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriminalTable;
