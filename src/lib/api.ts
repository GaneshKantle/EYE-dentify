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
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        if (process.env.NODE_ENV === 'development') {
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
        if (process.env.NODE_ENV === 'development') {
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

  // Direct API methods (without /api/v1 prefix) for routes at root level
  private getDirectClient(): AxiosInstance {
    const client = axios.create({
      baseURL: config.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': config.version,
        'X-Client-Environment': config.environment,
      },
    });

    // Add auth token interceptor for direct client
    client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return client;
  }

  async directGet<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const client = this.getDirectClient();
    const response = await client.get<T>(url, config);
    return response.data;
  }

  async directPost<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const client = this.getDirectClient();
    const response = await client.post<T>(url, data, config);
    return response.data;
  }

  async directPut<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const client = this.getDirectClient();
    const response = await client.put<T>(url, data, config);
    return response.data;
  }

  async directDelete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const client = this.getDirectClient();
    const response = await client.delete<T>(url, config);
    return response.data;
  }

  async directUploadFile<T = any>(
    url: string,
    formData: FormData,
    method: 'POST' | 'PUT' = 'POST',
    config?: AxiosRequestConfig
  ): Promise<T> {
    const client = this.getDirectClient();
    const requestConfig = {
      ...config,
      method,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    };
    
    const response = method === 'PUT' 
      ? await client.put<T>(url, formData, requestConfig)
      : await client.post<T>(url, formData, requestConfig);
    return response.data;
  }

  // Authentication methods
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.directPost<{ status: string; token: string; user: any }>('/auth/login', {
      email,
      password
    });
    return { token: response.token, user: response.user };
  }

  async register(
    email: string,
    username: string,
    password: string,
    secretKey: string,
    otp: string
  ): Promise<{ token: string; user: any }> {
    const response = await this.directPost<{ status: string; token: string; user: any }>('/auth/register', {
      email,
      username,
      password,
      secret_key: secretKey,
      otp
    });
    return { token: response.token, user: response.user };
  }

  async sendOtp(email: string): Promise<{ message: string }> {
    const response = await this.directPost<{ status: string; message: string }>('/auth/send-otp', { email });
    return { message: response.message };
  }

  async verifyOtp(email: string, otp: string): Promise<{ message: string }> {
    const response = await this.directPost<{ status: string; message: string }>('/auth/verify-otp', { email, otp });
    return { message: response.message };
  }

  async logout(): Promise<void> {
    await this.directPost('/auth/logout', {});
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.directGet<{ status: string; user: any }>('/auth/me');
    return response.user;
  }

  // Set authentication token for requests
  setAuthToken(token: string | null): void {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      this.getDirectClient().defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
      delete this.getDirectClient().defaults.headers.common['Authorization'];
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
