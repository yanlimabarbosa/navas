import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { FlyerPreview } from '../components/FlyerPreview';
import React from 'react';

export class PDFGenerator {
  // ...existing methods...

  static async generateJPGFromConfig(
    config: any,
    groups: any[],
    filename: string = 'encarte-promocional'
  ): Promise<void> {
    try {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      Object.assign(tempContainer.style, {
        width: '794px',
        height: '1123px',
        position: 'absolute',
        top: '-9999px',
        left: '0',
        zIndex: '-1',
        background: '#fff',
        boxSizing: 'border-box',
        fontFamily: "'Inter', Arial, sans-serif",
        fontSize: '16px',
        overflow: 'hidden',
      });
      document.body.appendChild(tempContainer);

      // Render the flyer
      const root = createRoot(tempContainer);
      root.render(
        React.createElement(FlyerPreview, {
          config,
          groups,
          className: 'export-mode',
        })
      );

      // Wait for render and fonts
      await new Promise((resolve) => setTimeout(resolve, 500));
      await document.fonts.ready;

      // Capture with html2canvas
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
      });

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);

      // Download
      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating JPG from config:', error);
      throw new Error('Erro ao gerar JPG');
    }
  }
} 