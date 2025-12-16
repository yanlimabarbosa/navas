import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { injectExportFonts } from './injectFonts';

// File System Access API types
interface FileSystemDirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write(data: Uint8Array): Promise<void>;
  close(): Promise<void>;
}

function applyPrintOptimizations(root: HTMLElement) {
  const priceTargets = root.querySelectorAll('[data-print-element="product-card-price"]');
  for (const el of Array.from(priceTargets)) {
    (el as HTMLElement).classList.add('export-price');
  }

  const multiplePriceTargets = root.querySelectorAll('[data-print-element="product-card-multiple-price"]');
  for (const el of Array.from(multiplePriceTargets)) {
    (el as HTMLElement).classList.add('export-multiple-price');
  }
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}

function getFlyerPages(element: HTMLElement): HTMLElement[] {
  if (element.classList.contains('flyer-page') || element.hasAttribute('data-flyer-page')) {
    return [element];
  }

  const flyerContainers = element.querySelectorAll('.flyer-page, [data-flyer-page]');
  if (flyerContainers.length > 0) {
    return Array.from(flyerContainers) as HTMLElement[];
  }

  return [element];
}

function getCleanFlyerContent(element: HTMLElement): HTMLElement[] {
  if (element.classList.contains('flyer-content')) {
    return [element];
  }

  const flyerContentElements = element.querySelectorAll('.flyer-content');
  if (flyerContentElements.length > 0) {
    return Array.from(flyerContentElements) as HTMLElement[];
  }

  return [element];
}

export async function exportElementAsImage(element: HTMLElement, filename: string = 'encarte.jpg'): Promise<void> {
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const flyerPages = getFlyerPages(element);
  const isMultipleFlyers = flyerPages.length > 1;

  if (isMultipleFlyers) {
    for (let i = 0; i < flyerPages.length; i++) {
      const pageElement = flyerPages[i];
      const pageNumber = i + 1;
      const pageFilename = filename.replace('.jpg', `-${pageNumber}.jpg`);

      await exportSingleFlyerAsImage(pageElement, pageFilename);
    }

    return;
  }

  await exportSingleFlyerAsImage(element, filename);
}

export async function exportElementAsImageBatch(element: HTMLElement, baseFilename: string = 'encarte'): Promise<void> {
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const flyerPages = getFlyerPages(element);
  console.log('🔍 Batch export: Found', flyerPages.length, 'flyer pages');

  if (flyerPages.length === 0) {
    throw new Error('Nenhuma página do encarte foi encontrada para exportar');
  }

  // For single page, use regular export
  if (flyerPages.length === 1) {
    console.log('📄 Single page detected, using regular export');
    await exportSingleFlyerAsImage(flyerPages[0], `${baseFilename}.jpg`);
    return;
  }

  // Try to use File System Access API for folder selection
  if ('showDirectoryPicker' in window) {
    console.log('📂 Using File System Access API for folder selection');
    try {
      const directoryHandle = await window.showDirectoryPicker();

      for (let i = 0; i < flyerPages.length; i++) {
        const pageElement = flyerPages[i];
        const pageNumber = i + 1;
        const pageFilename = `${baseFilename}-${pageNumber}.jpg`;

        console.log(`💾 Saving page ${pageNumber}: ${pageFilename}`);

        // Generate image data for this page
        const imageData = await generateImageData(pageElement);

        // Create file in selected directory
        const fileHandle = await directoryHandle.getFileHandle(pageFilename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(imageData);
        await writable.close();
      }

      console.log('🎉 Files saved to selected folder successfully');
      return;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('❌ Folder selection cancelled by user');
        throw new Error(
          'Seleção de pasta foi cancelada. Tente novamente e selecione uma pasta para salvar as imagens.'
        );
      }
      console.warn('Failed to use File System Access API:', error);
      // Fall back to ZIP method
    }
  }

  // Fallback: Create ZIP file with all pages
  console.log('📚 Using ZIP fallback for batch export');
  const zip = new JSZip();

  for (let i = 0; i < flyerPages.length; i++) {
    const pageElement = flyerPages[i];
    const pageNumber = i + 1;
    const pageFilename = `${baseFilename}-${pageNumber}.jpg`;

    console.log(`💾 Processing page ${pageNumber}: ${pageFilename}`);

    // Generate image data for this page
    const imageData = await generateImageData(pageElement);

    // Add to ZIP
    zip.file(pageFilename, imageData, { binary: true });
  }

  // Generate and download ZIP file
  console.log('🗜️ Generating ZIP file...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Download the ZIP file
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `${baseFilename}-pages.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('🎉 ZIP batch export completed successfully');
}

export async function exportElementAsPDFBatch(element: HTMLElement, baseFilename: string = 'encarte'): Promise<void> {
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const flyerPages = getFlyerPages(element);
  console.log('🔍 PDF Batch export: Found', flyerPages.length, 'flyer pages');

  if (flyerPages.length === 0) {
    throw new Error('Nenhuma página do encarte foi encontrada para exportar');
  }

  // For single page, use regular export
  if (flyerPages.length === 1) {
    console.log('📄 Single page detected, using regular PDF export');
    await exportSingleFlyerAsPDF(flyerPages[0], `${baseFilename}.pdf`);
    return;
  }

  // Try to use File System Access API for folder selection
  if ('showDirectoryPicker' in window) {
    console.log('📂 Using File System Access API for PDF folder selection');
    try {
      const directoryHandle = await window.showDirectoryPicker();

      for (let i = 0; i < flyerPages.length; i++) {
        const pageElement = flyerPages[i];
        const pageNumber = i + 1;
        const pageFilename = `${baseFilename}-${pageNumber}.pdf`;

        console.log(`💾 Saving PDF page ${pageNumber}: ${pageFilename}`);

        // Generate PDF data for this page
        const pdfData = await generatePDFData(pageElement);

        // Create file in selected directory
        const fileHandle = await directoryHandle.getFileHandle(pageFilename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(pdfData);
        await writable.close();
      }

      console.log('🎉 PDF files saved to selected folder successfully');
      return;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('❌ Folder selection cancelled by user');
        throw new Error('Seleção de pasta foi cancelada. Tente novamente e selecione uma pasta para salvar os PDFs.');
      }
      console.warn('Failed to use File System Access API for PDFs:', error);
      // Fall back to ZIP method
    }
  }

  // Fallback: Create ZIP file with all PDF pages
  console.log('📚 Using ZIP fallback for PDF batch export');
  const zip = new JSZip();

  for (let i = 0; i < flyerPages.length; i++) {
    const pageElement = flyerPages[i];
    const pageNumber = i + 1;
    const pageFilename = `${baseFilename}-${pageNumber}.pdf`;

    console.log(`💾 Processing PDF page ${pageNumber}: ${pageFilename}`);

    // Generate PDF data for this page
    const pdfData = await generatePDFData(pageElement);

    // Add to ZIP
    zip.file(pageFilename, pdfData, { binary: true });
  }

  // Generate and download ZIP file
  console.log('🗜️ Generating PDF ZIP file...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  // Download the ZIP file
  const link = document.createElement('a');
  link.href = URL.createObjectURL(zipBlob);
  link.download = `${baseFilename}-pages.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log('🎉 PDF ZIP batch export completed successfully');
}

// Helper function to generate image data as binary
async function generateImageData(element: HTMLElement): Promise<Uint8Array> {
  const scrollPosition = window.scrollY;
  const scrollXPosition = window.scrollX;

  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    overflow: hidden;
    z-index: -9999;
  `;

  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.fontFamily = "'Anton', sans-serif";
  clonedElement.style.fontWeight = '400';
  clonedElement.style.cssText = `
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    transform: none;
    position: relative;
    top: 0;
    left: 0;
  `;
  injectExportFonts(clonedElement);
  applyPrintOptimizations(clonedElement);
  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);

  try {
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];

    // Note: Image checking removed as it was causing false positives
    // The domtoimage library will handle missing images gracefully

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await domtoimage.toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px',
      },
    });

    // Convert data URL to binary
    const base64Data = dataUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } finally {
    document.body.removeChild(exportContainer);
    requestAnimationFrame(() => {
      window.scrollTo(scrollXPosition, scrollPosition);
    });
  }
}

// Helper function to generate PDF data as binary
async function generatePDFData(element: HTMLElement): Promise<Uint8Array> {
  const scrollPosition = window.scrollY;
  const scrollXPosition = window.scrollX;

  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    overflow: hidden;
    z-index: -9999;
  `;

  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.cssText = `
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    transform: none;
    position: relative;
    top: 0;
    left: 0;
  `;

  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);

  try {
    applyPrintOptimizations(clonedElement);
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];

    // Note: Image checking removed as it was causing false positives
    // The domtoimage library will handle missing images gracefully

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await domtoimage.toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px',
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = pdfHeight;
    const x = 0;
    const y = 0;

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);

    // Get PDF as binary data
    const pdfOutput = pdf.output('arraybuffer');
    return new Uint8Array(pdfOutput);
  } finally {
    document.body.removeChild(exportContainer);
    requestAnimationFrame(() => {
      window.scrollTo(scrollXPosition, scrollPosition);
    });
  }
}

async function exportSingleFlyerAsImage(element: HTMLElement, filename: string): Promise<void> {
  const scrollPosition = window.scrollY;
  const scrollXPosition = window.scrollX;

  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    overflow: hidden;
    z-index: 0;
  `;

  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.cssText = `
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    transform: none;
  `;

  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);

  try {
    applyPrintOptimizations(clonedElement);
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];

    // Note: Image checking removed as it was causing false positives
    // The domtoimage library will handle missing images gracefully

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await domtoimage.toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px',
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    document.body.removeChild(exportContainer);

    requestAnimationFrame(() => {
      window.scrollTo(scrollXPosition, scrollPosition);
    });
  }
}

export async function exportElementAsPDF(element: HTMLElement, filename: string = 'encarte.pdf'): Promise<void> {
  await document.fonts.ready;
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const flyerPages = getFlyerPages(element);
  const isMultipleFlyers = flyerPages.length > 1;

  if (isMultipleFlyers) {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    for (let i = 0; i < flyerPages.length; i++) {
      const pageElement = flyerPages[i];

      if (i > 0) {
        pdf.addPage();
      }

      await addFlyerPageToPDF(pdf, pageElement);
    }

    pdf.save(filename);
    return;
  }

  await exportSingleFlyerAsPDF(element, filename);
}

async function exportSingleFlyerAsPDF(element: HTMLElement, filename: string): Promise<void> {
  const scrollPosition = window.scrollY;
  const scrollXPosition = window.scrollX;

  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    overflow: hidden;
 
  `;

  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.cssText = `
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    transform: none;
 
  `;
  applyPrintOptimizations(clonedElement);
  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);

  try {
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];

    // Note: Image checking removed as it was causing false positives
    // The domtoimage library will handle missing images gracefully

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await domtoimage.toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px',
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = pdfHeight;
    const x = 0;
    const y = 0;

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
    pdf.save(filename);
  } finally {
    document.body.removeChild(exportContainer);

    requestAnimationFrame(() => {
      window.scrollTo(scrollXPosition, scrollPosition);
    });
  }
}

async function addFlyerPageToPDF(pdf: jsPDF, pageElement: HTMLElement): Promise<void> {
  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: ${pageElement.offsetWidth}px;
    height: ${pageElement.offsetHeight}px;
    overflow: hidden;
    z-index: -9999;
  `;

  const clonedElement = pageElement.cloneNode(true) as HTMLElement;
  clonedElement.style.cssText = `
    width: ${pageElement.offsetWidth}px;
    height: ${pageElement.offsetHeight}px;
    transform: none;
    position: relative;
    top: 0;
    left: 0;
  `;
  applyPrintOptimizations(clonedElement);
  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);

  try {
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];

    // Note: Image checking removed as it was causing false positives
    // The domtoimage library will handle missing images gracefully

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await domtoimage.toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px',
      },
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = pdfHeight;
    const x = 0;
    const y = 0;

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
  } finally {
    document.body.removeChild(exportContainer);
  }
}

export async function generateFlyerExportHTML(flyerElement: HTMLElement): Promise<string> {
  const clone = flyerElement.cloneNode(true) as HTMLElement;

  const imgElements = clone.querySelectorAll('img');
  const toDataURL = (img: HTMLImageElement) =>
    new Promise<string>((resolve) => {
      if (!img.src || img.src.startsWith('data:')) return resolve(img.src);
      const image = new window.Image();
      image.crossOrigin = 'anonymous';
      image.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(image, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      image.onerror = function () {
        resolve(img.src); // fallback
      };
      image.src = img.src;
    });
  for (const img of Array.from(imgElements)) {
    const dataUrl = await toDataURL(img);
    img.setAttribute('src', dataUrl);
  }

  let cssText = '';
  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      if (styleSheet.href && styleSheet.href.startsWith('http') && !styleSheet.href.includes(window.location.host))
        continue;
      const rules = styleSheet.cssRules;
      for (const rule of Array.from(rules)) {
        cssText += rule.cssText + '\n';
      }
    } catch {
      console.log('error');
    }
  }

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1240, initial-scale=1.0" />
<title>Flyer Export</title>
<style>
${cssText}
    html, body { 
      height: 100%; 
      margin: 0; 
      padding: 0; 
      background: #eee; 
      font-family: 'Anton', -apple-system, BlinkMacSystemFont !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    body { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      min-height: 100vh; 
      box-sizing: border-box; 
    }
    #flyer-export { 
      width: 1240px; 
      height: 1748px;
      background: #fff; 
      box-shadow: 0 0 24px #0002; 
      display: flex; 
      flex-direction: column; 
      overflow: visible; 
      position: relative; 
      box-sizing: border-box;
    }
    
    .text-center { text-align: center !important; }
    .text-left { text-align: left !important; }
    .text-right { text-align: right !important; }
    .uppercase { text-transform: uppercase !important; }
    .font-bold { font-weight: 700 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-extrabold { font-weight: 800 !important; }
    .w-full { width: 100% !important; }
    .h-full { height: 100% !important; }
    .flex { display: flex !important; }
    .flex-col { flex-direction: column !important; }
    .flex-1 { flex: 1 1 0% !important; }
    .bg-white { background-color: #ffffff !important; }
    .bg-black { background-color: #000000 !important; }
    .bg-yellow-400 { background-color: #facc15 !important; }
    .text-white { color: #ffffff !important; }
    .text-black { color: #000000 !important; }
    .relative { position: relative !important; }
    .absolute { position: absolute !important; }
    
    @media print { 
      html, body { 
        background: #fff !important; 
        width: 210mm; 
        height: 297mm; 
        margin: 0; 
        padding: 0; 
      } 
      #flyer-export { 
        width: 210mm; 
        box-shadow: none !important; 
        margin: 0 !important; 
        page-break-after: avoid; 
      } 
    }
  </style>
</head>
<body>
<div id="flyer-export">${clone.outerHTML}</div>
</body>
</html>`;
  return html;
}

export async function exportFlyerAsHTML(flyerElement: HTMLElement, filename: string = 'encarte.html'): Promise<string> {
  const html = await generateFlyerExportHTML(flyerElement);
  const preview = window.open();
  if (preview) {
    preview.document.open();
    preview.document.write(html);
    preview.document.close();
  }
  const blob = new Blob([html], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return html;
}

export async function exportFlyerHTMLAsImage(flyerElement: HTMLElement, filename: string = 'encarte.jpg') {
  return await exportElementAsImage(flyerElement, filename);
}

export async function exportFlyerHTMLAsPDF(flyerElement: HTMLElement, filename: string = 'encarte.pdf') {
  return await exportElementAsPDF(flyerElement, filename);
}
