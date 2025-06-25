import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';
import { FlyerPreview } from '../components/FlyerPreview';

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
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
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
      link.click();
    } catch (error) {
      console.error('Error generating JPG:', error);
      throw new Error('Erro ao gerar JPG');
    }
  }

  static async generateJPGFromConfig(
    config: any,
    groups: any[],
    filename: string = 'encarte-promocional'
  ): Promise<void> {
    try {
      // Create a temporary container
      const tempContainer = document.createElement('div');
      Object.assign(tempContainer.style, {
        width: `794px`,
        height: `1123px`,
        position: 'absolute',
        top: '-9999px',
        left: '0',
        zIndex: '-1',
        background: '#fff',
      });
      document.body.appendChild(tempContainer);

      // Render the flyer
      const root = createRoot(tempContainer);
      root.render(
        <FlyerPreview config={config} groups={groups} className="export-mode" />
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