// Face/Suspect data interface
export interface Face {
  name: string;
  age: string;
  crime: string;
  description: string;
  image_urls: string[];
}

// Recognition result interface
export interface RecognitionResult {
  status: 'recognized' | 'not_recognized' | 'error';
  name?: string;
  age?: string;
  crime?: string;
  description?: string;
  similarity?: number;
  image_url?: string;
  best_score?: number;
  message?: string;
}

// Toast interface
export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

// Gallery response interface
export interface GalleryResponse {
  faces: Face[];
}

// Form data interface
export interface FormData {
  name: string;
  age: string;
  crime: string;
  description: string;
  file: File | null;
}

// API Error interface
export interface ApiError {
  detail?: string;
  message?: string;
}
