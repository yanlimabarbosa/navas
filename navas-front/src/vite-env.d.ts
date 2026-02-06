/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI?: {
      getBackendUrl: () => Promise<string | null>;
      onBackendReady: (callback: (event: any, ...args: any[]) => void) => void;
      onBackendError: (callback: (message: string) => void) => void;
      onBackendStatus: (callback: (message: string) => void) => void;
      onImagensPath: (callback: (event: any, path: string) => void) => void;
      getImagensPath: () => Promise<string>;
      selectDirectory: () => Promise<string | null>;
      saveImageToDirectory: (dataURL: string, filename: string, directory: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      getLicenseStatus: () => Promise<{
        valid: boolean;
        reason?: string;
        message?: string;
        planType?: string;
        clientName?: string;
        activationDate?: string;
        expirationDate?: string;
        daysRemaining?: number;
        daysExpired?: number;
      }>;
    };
  }
}

export { };
