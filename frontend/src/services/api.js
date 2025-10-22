import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Criminal Database API
export const criminalAPI = {
  // Get all criminals
  getAllCriminals: async () => {
    const response = await api.get('/api/faces');
    return response.data;
  },

  // Register new criminal
  registerCriminal: async (formData) => {
    const response = await api.post('/api/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update criminal record
  updateCriminal: async (name, formData) => {
    const response = await api.put(`/api/update/${name}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete criminal
  deleteCriminal: async (name) => {
    const response = await api.delete(`/api/delete/${name}`);
    return response.data;
  },

  // Get image
  getImage: (imageId) => {
    return `${API_BASE_URL}/api/image/${imageId}`;
  },

  // Recognize face
  recognizeFace: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/recognize', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Clear database
  clearDatabase: async () => {
    const response = await api.post('/api/clear');
    return response.data;
  },
};

export default api;
