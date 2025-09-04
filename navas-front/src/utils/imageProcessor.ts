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
    
    // No fallback - must have config file
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
    
    return fullPath;
  }
}