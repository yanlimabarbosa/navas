import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { FlyerPreview } from '../components/FlyerPreview';
import { FlyerConfig, ProductGroup } from '../types';



// Helper to fetch and embed fonts
const embedFonts = async (clonedDoc: Document) => {
  try {
    const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap';
    const response = await fetch(fontUrl);
    const cssText = await response.text();
    
    const style = clonedDoc.createElement('style');
    style.appendChild(clonedDoc.createTextNode(cssText));
    clonedDoc.head.appendChild(style);
    
    // Give the browser a moment to acknowledge the new styles
    await new Promise(resolve => setTimeout(resolve, 200));

  } catch (error) {
    console.error('Error embedding fonts:', error);
  }
};

export class PDFGenerator {
  static async generateFromElement(element: HTMLElement, filename: string = 'encarte-promocional'): Promise<void> {
    try {
      // Wait for fonts to be ready
      await document.fonts.ready;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
          embedFonts(clonedDoc);
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the canvas proportionally
      const canvasAspectRatio = canvas.width / canvas.height;
      const pdfAspectRatio = pdfWidth / pdfHeight;

      let imgWidth, imgHeight;
      if (canvasAspectRatio > pdfAspectRatio) {
        imgWidth = pdfWidth;
        imgHeight = pdfWidth / canvasAspectRatio;
      } else {
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * canvasAspectRatio;
      }

      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
      pdf.save(`${filename}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Erro ao gerar PDF');
    }
  }

  static async generateJPG(element: HTMLElement, filename: string = 'encarte-promocional'): Promise<void> {
    try {
      // Wait for fonts to be ready
      await document.fonts.ready;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          embedFonts(clonedDoc);
        }
      });

      const link = document.createElement('a');
      link.download = `${filename}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating JPG:', error);
      throw new Error('Erro ao gerar JPG');
    }
  }

  static async generateJPGFromConfig(
    config: FlyerConfig,
    groups: ProductGroup[],
    filename: string = 'encarte-promocional'
  ): Promise<void> {
    try {
      // Create a temporary container with the same dimensions as the preview
      const tempContainer = document.createElement('div');
      Object.assign(tempContainer.style, {
        width: '1240px',
        height: '1748px', // Match the preview dimensions exactly
        position: 'absolute',
        top: '-9999px',
        left: '0',
        zIndex: '-1',
        background: '#fff',
        boxSizing: 'border-box',
        fontFamily: "'Inter', Arial, sans-serif",
        fontSize: '16px',
        overflow: 'visible', // Changed from 'hidden' to 'visible'
        visibility: 'visible',
      });
      
      document.body.appendChild(tempContainer);

      // Render the flyer with the same props as the preview
      const root = createRoot(tempContainer);
      await new Promise<void>((resolve) => {
        root.render(
          <FlyerPreview config={config} groups={groups} className="export-mode" />
        );
        // Use requestAnimationFrame to ensure the render is complete
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      });

      // Copy all styles from the main document to ensure consistency
      const allStyles = Array.from(document.styleSheets).reduce((css, sheet) => {
        try {
          return css + Array.from(sheet.cssRules).reduce((rules, rule) => {
            return rules + rule.cssText + '\n';
          }, '');
        } catch {
          return css;
        }
      }, '');

      const styleElement = document.createElement('style');
      styleElement.textContent = allStyles;
      tempContainer.appendChild(styleElement);

      // Wait for render and fonts to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await document.fonts.ready;

      // Capture with html2canvas using the same dimensions as preview
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 1240,
        height: 1748,
        onclone: (clonedDoc) => {
          embedFonts(clonedDoc);
          
          // Copy all computed styles to the cloned document
          const originalElements = tempContainer.querySelectorAll('*');
          const clonedElements = clonedDoc.querySelectorAll('*');
          
          originalElements.forEach((originalEl, index) => {
            if (originalEl instanceof HTMLElement && clonedElements[index]) {
              const clonedEl = clonedElements[index] as HTMLElement;
              const computedStyle = window.getComputedStyle(originalEl);
              
              // Copy critical style properties
              clonedEl.style.cssText = computedStyle.cssText;
              clonedEl.style.fontFamily = computedStyle.fontFamily;
              clonedEl.style.fontSize = computedStyle.fontSize;
              clonedEl.style.fontWeight = computedStyle.fontWeight;
              clonedEl.style.color = computedStyle.color;
              clonedEl.style.backgroundColor = computedStyle.backgroundColor;
              clonedEl.style.display = computedStyle.display;
              clonedEl.style.flexDirection = computedStyle.flexDirection;
              clonedEl.style.justifyContent = computedStyle.justifyContent;
              clonedEl.style.alignItems = computedStyle.alignItems;
              clonedEl.style.textAlign = computedStyle.textAlign;
              clonedEl.style.overflow = computedStyle.overflow;
              clonedEl.style.textOverflow = computedStyle.textOverflow;
              clonedEl.style.whiteSpace = computedStyle.whiteSpace;
            }
          });
        }
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