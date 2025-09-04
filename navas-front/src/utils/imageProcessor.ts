export class ImageProcessor {
  private static imagesPrefix: string | null = null;

  // Initialize the images prefix when the app starts
  static async initializeImagesPrefix(): Promise<void> {
    // Always try to get from config file (both dev and production)
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      try {
        const electronAPI = (window as any).electronAPI;
        if (typeof electronAPI.getImagensPath === 'function') {
          const sharedPath = await electronAPI.getImagensPath();
          if (sharedPath) {
            this.imagesPrefix = sharedPath.replace(/\\/g, '/') + '/';
            console.log('Using shared folder:', this.imagesPrefix);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to get shared folder path:', error);
      }
    }
    
    // Development mode fallback - use a mock path or disable image loading
    if (import.meta.env.DEV) {
      console.warn('Development mode: Images will not be loaded. Use Electron build for full functionality.');
      this.imagesPrefix = 'mock://images/';
      return;
    }
    
    // Production mode - must have config file
    throw new Error('No shared folder configured. Check navas-caminho-imagens.txt file.');
  }

  // Get the full image path
  static getImagePath(imageName: string | undefined | null): string {
    if (!this.imagesPrefix) {
      throw new Error('Images prefix not initialized. Call initializeImagesPrefix() first.');
    }
    
    if (!imageName) {
      return '';
    }
    
    const baseName = String(imageName);
    const extension = baseName.includes('.') ? '' : '.jpg';
    const fullPath = `${this.imagesPrefix}${baseName}${extension}`;
    
    // In development mode with mock path, return a placeholder
    if (import.meta.env.DEV && this.imagesPrefix.startsWith('mock://')) {
      return `data:image/svg+xml;base64,${btoa(`
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="100" y="100" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="#6b7280">
            ${baseName}
          </text>
        </svg>
      `)}`;
    }
    
    return fullPath;
  }
}