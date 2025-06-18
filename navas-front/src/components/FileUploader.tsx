import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { ExcelProcessor } from '../utils/excelProcessor';
import { Product } from '../types';

interface FileUploaderProps {
  onProductsLoaded: (products: Product[]) => void;
  onError: (error: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onProductsLoaded, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileProcess = useCallback(async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      onError('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      setUploadStatus('error');
      return;
    }

    setIsProcessing(true);
    setUploadStatus('idle');

    try {
      const isValid = await ExcelProcessor.validateExcelStructure(file);
      if (!isValid) {
        throw new Error('Estrutura do arquivo Excel inválida. Certifique-se que possui as colunas: Código, Produto, Preço');
      }

      const products = await ExcelProcessor.processFile(file);
      if (products.length === 0) {
        throw new Error('Nenhum produto válido encontrado no arquivo Excel');
      }

      onProductsLoaded(products);
      setUploadStatus('success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao processar arquivo';
      onError(errorMessage);
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  }, [onProductsLoaded, onError]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, [handleFileProcess]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  }, [handleFileProcess]);

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <FileSpreadsheet className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'success':
        return 'Arquivo processado com sucesso!';
      case 'error':
        return 'Erro no processamento do arquivo';
      default:
        return 'Arraste um arquivo Excel aqui ou clique para selecionar';
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center space-y-4">
            {isProcessing ? (
              <div className="animate-spin">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
            ) : (
              getStatusIcon()
            )}
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isProcessing ? 'Processando arquivo...' : getStatusText()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Formato suportado: Excel (.xlsx, .xls)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Colunas: Código, Produto, Preço
              </p>
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};