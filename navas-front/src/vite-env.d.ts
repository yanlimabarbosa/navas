/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI: {
      getBackendUrl: () => Promise<string | null>;
      onBackendReady: (callback: (event: any, ...args: any[]) => void) => void;
      onBackendError: (callback: (message: string) => void) => void;
      onBackendStatus: (callback: (message: string) => void) => void;
      onImagensPath: (callback: (event: any, path: string) => void) => void;
      getImagensPath: () => Promise<string>;
    };
  }
}

export {};
