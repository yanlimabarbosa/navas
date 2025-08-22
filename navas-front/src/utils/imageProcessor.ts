export class ImageProcessor {
  static readonly SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];

  static getImagePath(baseFileName: string | undefined | null, prefix: string = 'imagens_produtos/'): string {
    console.log('getImagePath', baseFileName, prefix);
    // Handle undefined or null baseFileName
    if (!baseFileName) {
      console.warn('Nome do arquivo de imagem não fornecido');
      return '';
    }
    // Force to string
    const baseName = String(baseFileName);
    let imgPath = baseName;
    
    if (!imgPath.includes('.')) {
      // For files without extension, we'll try different approaches:
      // 1. First, return the path with .jpg extension as default
      // 2. The browser will attempt to load it, and if it fails, 
      //    the img.onerror handler in the component can try other extensions
      imgPath = `${baseName}.jpg`;
    }
    
    let fullPath = `${prefix}${imgPath}`;
    if (fullPath.startsWith('/')) fullPath = fullPath.slice(1);
    return fullPath;
  }

  static getImageWithFallbacks(baseFileName: string | undefined | null, prefix: string = 'imagens_produtos/'): string[] {
    if (!baseFileName) {
      return [];
    }
    
    const baseName = String(baseFileName);
    
    if (baseName.includes('.')) {
      let fullPath = `${prefix}${baseName}`;
      if (fullPath.startsWith('/')) fullPath = fullPath.slice(1);
      return [fullPath];
    }
    
    return ImageProcessor.SUPPORTED_EXTENSIONS.map(ext => {
      let fullPath = `${prefix}${baseName}${ext}`;
      if (fullPath.startsWith('/')) fullPath = fullPath.slice(1);
      return fullPath;
    });
  }

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

  static async processImageFile(
    file: File,
    targetDimensions: { width: number; height: number }
  ): Promise<string> {
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
}