/// <reference types="vite/client" />

declare global {
  interface Window {
    electronAPI: {
      getBackendUrl: () => Promise<string | null>;
      onBackendReady: (callback: (event: Event, ...args: any[]) => void) => void;
      onBackendError: (callback: (message: string) => void) => void;
      onBackendStatus: (callback: (message: string) => void) => void;
      onImagensPath: (callback: (event: Event, path: string) => void) => void;
      getImagensPath: () => Promise<string>;
      selectDirectory: () => Promise<string | null>;
      selectImagesDirectory: () => Promise<string | null>;
      saveSettings: (settings: { imagesPath?: string }) => Promise<boolean>;
      getSettings: () => Promise<{ imagesPath?: string }>;
      saveImageToDirectory: (
        dataURL: string,
        filename: string,
        directory: string
      ) => Promise<{ success: boolean; path?: string; error?: string }>;
    };
  }
}

export {};
