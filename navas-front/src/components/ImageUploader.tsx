import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, X, Check, AlertCircle } from 'lucide-react';
import { ImageProcessor } from '../utils/imageProcessor';

interface ImageUploaderProps {
  label: string;
  currentImageUrl?: string;
  expectedDimensions: { width: number; height: number };
  onImageChange: (imageUrl: string | undefined) => void;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  currentImageUrl,
  expectedDimensions,
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
      const processedImageUrl = await ImageProcessor.processImageFile(file, expectedDimensions);
      onImageChange(processedImageUrl);
      setSuccess('Imagem processada com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar imagem';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [expectedDimensions, onImageChange]);

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
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="text-xs text-gray-500 mb-2">
        Dimensões recomendadas: {expectedDimensions.width}x{expectedDimensions.height} pixels
      </div>

      {currentImageUrl ? (
        <div className="relative">
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
            <img
              src={currentImageUrl}
              alt={label}
              className="w-full h-24 object-cover"
            />
          </div>
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
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
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400" />
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {isProcessing ? 'Processando...' : 'Clique ou arraste uma imagem'}
                </p>
                <p className="text-xs text-gray-500">
                  JPG ou PNG
                </p>
              </div>
            </div>
          </label>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
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