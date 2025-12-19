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

  // Process image file for upload (header/footer images)
  static async processImageFile(file: File, targetDimensions: { width: number; height: number }): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('Arquivo deve ser uma imagem (JPG ou PNG)');
    }

    try {
      const processedImage = await this.resizeImage(file, targetDimensions, 0.95);
      return processedImage;
    } catch {
      throw new Error('Erro ao processar imagem. Verifique se o arquivo é válido.');
    }
  }

  // Resize image to target dimensions
  static resizeImage(
    file: File,
    targetDimensions: { width: number; height: number },
    quality: number = 0.9
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = targetDimensions.width;
        canvas.height = targetDimensions.height;

        if (ctx) {
          // Clear canvas with white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Calculate aspect ratio and positioning
          const imgAspect = img.width / img.height;
          const targetAspect = targetDimensions.width / targetDimensions.height;

          let drawWidth, drawHeight, offsetX, offsetY;

          if (imgAspect > targetAspect) {
            // Image is wider than target
            drawHeight = targetDimensions.height;
            drawWidth = drawHeight * imgAspect;
            offsetX = (targetDimensions.width - drawWidth) / 2;
            offsetY = 0;
          } else {
            // Image is taller than target
            drawWidth = targetDimensions.width;
            drawHeight = drawWidth / imgAspect;
            offsetX = 0;
            offsetY = (targetDimensions.height - drawHeight) / 2;
          }

          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}
