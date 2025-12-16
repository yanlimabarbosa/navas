import React from 'react';
import { Download } from 'lucide-react';
import { Button } from './ui/button';
import { generateExcelTemplate } from '../utils/excelTemplateGenerator';

export const TemplateDownloadPanel: React.FC = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
        📥 Download do Modelo de Planilha
      </h3>
      <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
        Baixe o modelo com exemplos de preenchimento para importar seus produtos.
      </p>

      <Button
        onClick={() => generateExcelTemplate()}
        className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
        size="sm"
      >
        <Download className="w-4 h-4" />
        Baixar Modelo Planilha
      </Button>
    </div>
  );
};
