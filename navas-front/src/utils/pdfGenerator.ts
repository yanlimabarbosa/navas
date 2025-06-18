import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  static async generateFromElement(element: HTMLElement, filename: string = 'encarte-promocional'): Promise<void> {
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
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
        allowTaint: true,
        backgroundColor: '#ffffff',
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
}