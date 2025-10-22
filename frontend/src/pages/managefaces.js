import React from 'react';
import { Users, Trash2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

function ManageTab({ faces, onDelete, onClear, loading }) {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Registered Faces</h2>
          <button
            onClick={onClear}
            disabled={loading || faces.length === 0}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>
        
        {faces.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No faces registered</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by registering a new face.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faces.map((face, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {face.image_id ? (
                      <img
                        src={`${API_BASE_URL}/api/image/${face.image_id}`}
                        alt={face.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{face.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onDelete(face.name)}
                    disabled={loading}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTab;
