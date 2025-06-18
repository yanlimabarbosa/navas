export class ImageProcessor {
  static validateImageDimensions(
    file: File, 
    expectedDimensions: { width: number; height: number }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const isValid = img.width === expectedDimensions.width && 
                       img.height === expectedDimensions.height;
        resolve(isValid);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
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
      // Always resize to ensure consistent dimensions
      const processedImage = await this.resizeImage(file, targetDimensions, 0.95);
      return processedImage;
    } catch (error) {
      throw new Error('Erro ao processar imagem. Verifique se o arquivo é válido.');
    }
  }
}