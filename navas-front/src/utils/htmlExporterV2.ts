import { toJpeg } from 'html-to-image';
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

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
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

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      backgroundColor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px',
      },
      fontEmbedCSS: '', // Disable default font embedding if we are handling it manually, or let it handle it. 
      // html-to-image handles fonts better, but we already have manual injection. 
      // Let's try with our manual injection first since it's already set up.
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
  clonedElement.classList.add('exporting');
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

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      backgroundColor: '#ffffff',
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
  clonedElement.classList.add('exporting');
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

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      backgroundColor: '#ffffff',
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
  clonedElement.classList.add('exporting');
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

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      backgroundColor: '#ffffff',
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
  clonedElement.classList.add('exporting');
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

    const A4_WIDTH_PX = 2480;
    const A4_HEIGHT_PX = 3508;

    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY);

    const dataUrl = await toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,
      height: A4_HEIGHT_PX,
      backgroundColor: '#ffffff',
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
