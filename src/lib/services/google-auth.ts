// GOOGLE AUTH IS DISABLED FOR FIREBASE DEMO
// All code in this file is now inactive. See firestore-data.ts for new backend.
//
// /**
//  * Google OAuth Authentication Service
//  * Handles Google Sign-In and token management
//  */
//
// export interface GoogleAuthConfig {
//   clientId: string;
//   scopes: string[];
//   redirectUri?: string;
// }
//
// export interface GoogleUser {
//   email: string;
//   name: string;
//   picture: string;
//   googleId: string;
// }
//
// export interface GoogleAuthToken {
//   accessToken: string;
//   refreshToken?: string;
//   expiresAt: number;
//   scope: string;
// }
//
// class GoogleAuthService {
//   private static instance: GoogleAuthService;
//   private config: GoogleAuthConfig | null = null;
//   private currentUser: GoogleUser | null = null;
//   private authToken: GoogleAuthToken | null = null;
//
//   // Google OAuth scopes
//   private readonly SCOPES = [
//     'https://www.googleapis.com/auth/userinfo.email',
//     'https://www.googleapis.com/auth/userinfo.profile',
//     'https://www.googleapis.com/auth/drive.file', // Only files created by this app
//     'https://www.googleapis.com/auth/spreadsheets', // Create and manage spreadsheets
//   ];
//
//   private constructor() {
//     this.loadFromStorage();
//   }
//
//   static getInstance(): GoogleAuthService {
//     if (!GoogleAuthService.instance) {
//       GoogleAuthService.instance = new GoogleAuthService();
//     }
//     return GoogleAuthService.instance;
//   }
//
//   /**
//    * Initialize Google Auth with client configuration
//    */
//   async initialize(clientId: string): Promise<void> {
//     this.config = {
//       clientId,
//       scopes: this.SCOPES,
//     };
//
//     // Load Google Identity Services library
//     await this.loadGoogleScript();
//   }
//
//   /**
//    * Load Google Identity Services script
//    */
//   private loadGoogleScript(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       if (typeof window === 'undefined') {
//         reject(new Error('Google Auth only works in browser'));
//         return;
//       }
//
//       // Check if already loaded
//       if (window.google?.accounts?.oauth2) {
//         resolve();
//         return;
//       }
//
//       const script = document.createElement('script');
//       script.src = 'https://accounts.google.com/gsi/client';
//       script.async = true;
//       script.defer = true;
//       script.onload = () => resolve();
//       script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
//       document.head.appendChild(script);
//     });
//   }
//
//   /**
//    * Sign in with Google (popup flow)
//    */
//   async signIn(): Promise<GoogleUser> {
//     if (!this.config) {
//       throw new Error('Google Auth not initialized. Call initialize() first.');
//     }
//
//     return new Promise((resolve, reject) => {
//       const client = window.google?.accounts?.oauth2?.initTokenClient({
//         client_id: this.config!.clientId,
//         scope: this.SCOPES.join(' '),
//         callback: async (response: any) => {
//           if (response.error) {
//             reject(new Error(response.error));
//             return;
//           }
//
//           try {
//             // Store access token
//             this.authToken = {
//               accessToken: response.access_token,
//               expiresAt: Date.now() + (response.expires_in * 1000),
//               scope: response.scope,
//             };
//
//             // Fetch user info
//             const userInfo = await this.fetchUserInfo(response.access_token);
//             this.currentUser = userInfo;
//
//             // Save to storage
//             this.saveToStorage();
//
//             resolve(userInfo);
//           } catch (error) {
//             reject(error);
//           }
//         },
//       });
//
//       client?.requestAccessToken();
//     });
//   }
//
//   /**
//    * Fetch user profile information
//    */
//   private async fetchUserInfo(accessToken: string): Promise<GoogleUser> {
//     const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//
//     if (!response.ok) {
//       throw new Error('Failed to fetch user info');
//     }
//
//     const data = await response.json();
//     return {
//       email: data.email,
//       name: data.name,
//       picture: data.picture,
//       googleId: data.id,
//     };
//   }
//
//   /**
//    * Sign out and clear session
//    */
//   signOut(): void {
//     this.currentUser = null;
//     this.authToken = null;
//     this.clearStorage();
//
//     // Revoke token
//     if (this.authToken?.accessToken) {
//       window.google?.accounts?.oauth2?.revoke(this.authToken.accessToken);
//     }
//   }
//
//   /**
//    * Get current user
//    */
//   getCurrentUser(): GoogleUser | null {
//     return this.currentUser;
//   }
//
//   /**
//    * Get valid access token (refreshes if needed)
//    */
//   async getAccessToken(): Promise<string> {
//     if (!this.authToken) {
//       throw new Error('Not authenticated. Please sign in first.');
//     }
//
//     // Check if token expired
//     if (Date.now() >= this.authToken.expiresAt) {
//       // Token expired, need to re-authenticate
//       throw new Error('Session expired. Please sign in again.');
//     }
//
//     return this.authToken.accessToken;
//   }
//
//   /**
//    * Check if user is authenticated
//    */
//   isAuthenticated(): boolean {
//     return this.currentUser !== null && this.authToken !== null;
//   }
//
//   /**
//    * Save auth state to localStorage
//    */
//   private saveToStorage(): void {
//     if (typeof window === 'undefined') return;
//
//     try {
//       localStorage.setItem('dermair-google-user', JSON.stringify(this.currentUser));
//       localStorage.setItem('dermair-google-token', JSON.stringify(this.authToken));
//     } catch (error) {
//       console.error('Failed to save auth state:', error);
//     }
//   }
//
//   /**
//    * Load auth state from localStorage
//    */
//   private loadFromStorage(): void {
//     if (typeof window === 'undefined') return;
//
//     try {
//       const userStr = localStorage.getItem('dermair-google-user');
//       const tokenStr = localStorage.getItem('dermair-google-token');
//
//       if (userStr && tokenStr) {
//         this.currentUser = JSON.parse(userStr);
//         this.authToken = JSON.parse(tokenStr);
//
//         // Check if token expired
//         if (this.authToken && Date.now() >= this.authToken.expiresAt) {
//           this.signOut();
//         }
//       }
//     } catch (error) {
//       console.error('Failed to load auth state:', error);
//       this.clearStorage();
//     }
//   }
//
//   /**
//    * Clear auth state from storage
//    */
//   private clearStorage(): void {
//     if (typeof window === 'undefined') return;
//
//     try {
//       localStorage.removeItem('dermair-google-user');
//       localStorage.removeItem('dermair-google-token');
//     } catch (error) {
//       console.error('Failed to clear auth state:', error);
//     }
//   }
// }
//
// // Export singleton instance
// export const googleAuth = GoogleAuthService.getInstance();
//
// // Type definitions for Google Identity Services
// declare global {
//   interface Window {
//     google?: {
//       accounts?: {
//         oauth2?: {
//           initTokenClient: (config: any) => any;
//           revoke: (token: string) => void;
//         };
//       };
//     };
//   }
// }
