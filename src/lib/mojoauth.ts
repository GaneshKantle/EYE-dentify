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
  private apiKey: string;
  private redirectUrl: string;
  private mojoAuthInstance: any = null;
  private isInitialized: boolean = false;

  constructor() {
    // Get API key from environment - required
    this.apiKey = process.env.REACT_APP_MOJOAUTH_API_KEY || '';
    if (!this.apiKey) {
      console.error('REACT_APP_MOJOAUTH_API_KEY is required. Set it in your .env file.');
      throw new Error('MojoAuth API key is not configured. Please set REACT_APP_MOJOAUTH_API_KEY in your environment variables.');
    }
    
    // Determine redirect URL based on environment
    const getRedirectUrl = () => {
      if (process.env.REACT_APP_MOJOAUTH_REDIRECT_URL) {
        return process.env.REACT_APP_MOJOAUTH_REDIRECT_URL;
      }
      if (process.env.NODE_ENV === 'production') {
        return 'https://eye-dentify.vercel.app/register/verify-otp';
      }
      return `${window.location.origin}/register/verify-otp`;
    };
    
    this.redirectUrl = getRedirectUrl();
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
      this.mojoAuthInstance = new window.MojoAuth(this.apiKey, {
        language: 'en',
        redirect_url: this.redirectUrl,
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
      const response = await fetch(`${apiUrl}/auth/send-mojoauth-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || errorData.message || 'Failed to send OTP';
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
      throw new Error(error?.message || 'Failed to initiate OTP');
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

