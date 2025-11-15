/**
 * MojoAuth Service Wrapper
 * Handles email OTP authentication using MojoAuth SDK
 */

declare global {
  interface Window {
    MojoAuth: any;
  }
}

export interface MojoAuthConfig {
  apiKey: string;
  redirectUrl: string;
  language?: string;
}

export interface MojoAuthResponse {
  state_id: string;
  email?: string;
  verified?: boolean;
}

export interface MojoAuthError {
  error: string;
  message: string;
}

class MojoAuthService {
  private apiKey: string | null = null;
  private redirectUrl: string | null = null;
  private mojoAuthInstance: any = null;
  private isInitialized: boolean = false;

  constructor() {
    // Lazy initialization - don't validate until actually used
    // This allows the app to load even if env vars aren't set
  }

  /**
   * Get API key - lazy loaded from environment
   */
  private getApiKey(): string {
    if (this.apiKey === null) {
      this.apiKey = process.env.REACT_APP_MOJOAUTH_API_KEY || '';
      if (!this.apiKey) {
        console.warn('REACT_APP_MOJOAUTH_API_KEY is not set. MojoAuth features may not work.');
      }
    }
    return this.apiKey;
  }

  /**
   * Get redirect URL - lazy loaded from environment
   */
  private getRedirectUrl(): string {
    if (this.redirectUrl === null) {
      if (process.env.REACT_APP_MOJOAUTH_REDIRECT_URL) {
        this.redirectUrl = process.env.REACT_APP_MOJOAUTH_REDIRECT_URL;
      } else if (process.env.NODE_ENV === 'production') {
        this.redirectUrl = 'https://eye-dentify.vercel.app/register/verify-otp';
      } else {
        this.redirectUrl = `${window.location.origin}/register/verify-otp`;
      }
    }
    return this.redirectUrl;
  }

  /**
   * Initialize MojoAuth SDK
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized && this.mojoAuthInstance) {
      return;
    }

    // Wait for MojoAuth SDK to load
    if (!window.MojoAuth) {
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50;
        const checkInterval = setInterval(() => {
          attempts++;
          if (window.MojoAuth) {
            clearInterval(checkInterval);
            resolve();
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            reject(new Error('MojoAuth SDK failed to load'));
          }
        }, 100);
      });
    }

    // Ensure container exists in DOM before initialization
    const containerId = 'mojoauth-container';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.display = 'none';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.overflow = 'hidden';
      document.body.appendChild(container);
    }

    try {
      // Initialize MojoAuth SDK
      // Note: MojoAuth SDK may require container to be specified during signIn, not initialization
      const apiKey = this.getApiKey();
      if (!apiKey) {
        throw new Error('MojoAuth API key is not configured. Please set REACT_APP_MOJOAUTH_API_KEY in your environment variables.');
      }
      this.mojoAuthInstance = new window.MojoAuth(apiKey, {
        language: 'en',
        redirect_url: this.getRedirectUrl(),
        source: [{ type: 'email', feature: 'otp' }],
      });
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize MojoAuth: ${error}`);
    }
  }

  /**
   * Initiate OTP flow for email
   * Uses backend API which calls MojoAuth REST API directly
   * This is more reliable than using the SDK programmatically
   */
  async initiateOTP(email: string): Promise<MojoAuthResponse> {
    try {
      // Use backend API to send OTP - backend will call MojoAuth REST API
      const apiUrl = this.getApiBaseUrl();
      const url = `${apiUrl}/auth/send-mojoauth-otp`;
      
      console.log(`📤 Sending OTP request to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send OTP';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch (e2) {
            // Ignore
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.state_id) {
        return {
          state_id: data.state_id,
          email: email,
        };
      }

      throw new Error('Invalid response from server - no state_id found');
    } catch (error: any) {
      console.error('MojoAuth initiateOTP error:', error);
      
      // Handle network errors with more helpful messages
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const apiUrl = this.getApiBaseUrl();
        throw new Error(
          `Cannot connect to backend server at ${apiUrl}. ` +
          `Please ensure the backend is running. ` +
          `If running locally, start the backend server on port 8000.`
        );
      }
      
      // Handle other fetch errors
      if (error.name === 'NetworkError' || error.message.includes('NetworkError')) {
        const apiUrl = this.getApiBaseUrl();
        throw new Error(
          `Network error: Cannot reach backend server at ${apiUrl}. ` +
          `Please check your internet connection and ensure the backend is running.`
        );
      }
      
      throw new Error(error?.message || 'Failed to initiate OTP. Please try again.');
    }
  }

  /**
   * Get API base URL
   */
  private getApiBaseUrl(): string {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    if (process.env.NODE_ENV === 'production') {
      return 'https://eye-dentify.onrender.com';
    }
    return 'http://localhost:8000';
  }

  /**
   * Verify OTP using state ID
   * Note: Actual OTP verification happens on the backend
   * This method just returns the state ID for backend verification
   */
  async verifyOTP(stateId: string): Promise<MojoAuthResponse> {
    // For MojoAuth, the OTP verification is handled by the backend
    // The backend will verify the MojoAuth state using the API
    // We just need to pass the state_id to the backend
    return {
      state_id: stateId,
      verified: true, // Backend will verify this
    };
  }
}

// Export singleton instance
export const mojoAuthService = new MojoAuthService();

