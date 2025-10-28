import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Environment configuration
const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  apiVersion: process.env.REACT_APP_API_VERSION || 'v1',
  environment: process.env.REACT_APP_ENVIRONMENT || 'development',
  debug: process.env.REACT_APP_DEBUG === 'true',
  version: process.env.REACT_APP_VERSION || '1.0.0',
};

// API Client configuration
class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${config.apiUrl}/api/${config.apiVersion}`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': config.version,
        'X-Client-Environment': config.environment,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (config.debug || process.env.NODE_ENV === 'development') {
          console.log('API Request:', config);
        }
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        if (config.debug || process.env.NODE_ENV === 'development') {
          console.log('API Response:', response);
        }
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.warn('Unauthorized access - redirecting to login');
        } else if (error.response?.status === 429) {
          // Handle rate limiting
          console.warn('Rate limit exceeded - please wait');
        } else if (error.response?.status >= 500) {
          // Handle server errors
          console.error('Server error occurred');
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.request(config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // File upload method
  async uploadFile<T = any>(
    url: string,
    file: File,
    additionalData?: Record<string, string>,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.request<T>({
      ...config,
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Error handling
  private handleError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return new Error(`API Error ${status}: ${data?.message || data?.detail || 'Unknown error'}`);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error: No response from server');
    } else {
      // Something else happened
      return new Error(error.message || 'Unknown error occurred');
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new APIClient();

// Export configuration
export { config };

// Export types
export interface APIResponse<T = any> {
  data: T;
  message?: string;
  status: string;
  timestamp: string;
}

export interface APIError {
  error: string;
  message: string;
  error_code: string;
  timestamp: string;
  details?: any;
}
