import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, Check, AlertCircle } from 'lucide-react';
import { ImageProcessor } from '../utils/imageProcessor';

interface ImageUploaderProps {
  label: string;
  currentImage?: string;
  targetDimensions: { width: number; height: number };
  onImageChange: (imageUrl: string | undefined) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  currentImage,
  targetDimensions,
  onImageChange,
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const processedImageUrl = await ImageProcessor.processImageFile(file, targetDimensions);
      onImageChange(processedImageUrl);
      setSuccess('Imagem processada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar imagem';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [targetDimensions, onImageChange]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemoveImage = () => {
    onImageChange(undefined);
    setError('');
    setSuccess('');
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-xs text-muted-foreground">
        Dimensões recomendadas: {targetDimensions.width}x{targetDimensions.height} pixels
      </div>

      {currentImage ? (
        <div className="relative">
          <div className="border-2 border-border rounded-lg overflow-hidden">
            <img
              src={currentImage}
              alt={label}
              className="w-full h-24 object-cover"
            />
          </div>
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-primary/50 hover:bg-accent/50 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileInput}
            className="hidden"
            id={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            disabled={isProcessing}
          />
          
          <label
            htmlFor={`image-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
            className="cursor-pointer"
          >
            <div className="flex flex-col items-center space-y-2">
              {isProcessing ? (
                <div className="animate-spin">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
              ) : (
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              )}
              
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isProcessing ? 'Processando...' : 'Clique ou arraste uma imagem'}
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG ou PNG
                </p>
              </div>
            </div>
          </label>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};