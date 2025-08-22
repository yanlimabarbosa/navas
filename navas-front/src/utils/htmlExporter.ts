import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

// Helper function to get flyer pages from element
function getFlyerPages(element: HTMLElement): HTMLElement[] {
  // If the element itself is a flyer page, return just it
  if (element.classList.contains('flyer-page') || element.hasAttribute('data-flyer-page')) {
    return [element];
  }
  
  // Look for multiple flyer pages within the element
  const flyerContainers = element.querySelectorAll('.flyer-page, [data-flyer-page]');
  if (flyerContainers.length > 0) {
    return Array.from(flyerContainers) as HTMLElement[];
  }
  
  // Fallback: if no explicit flyer pages, treat the whole element as one flyer
  return [element];
}

// Helper function to get clean flyer content for export (without UI elements)
function getCleanFlyerContent(element: HTMLElement): HTMLElement[] {
  // If exporting individual page, get the flyer content
  if (element.classList.contains('flyer-content')) {
    return [element];
  }
  
  // If exporting all pages, get all flyer content elements
  const flyerContentElements = element.querySelectorAll('.flyer-content');
  if (flyerContentElements.length > 0) {
    return Array.from(flyerContentElements) as HTMLElement[];
  }
  
  // Fallback: if no flyer content found, use the element itself
  return [element];
}

// DIRECT CAPTURE WITH DOM-TO-IMAGE - NO HTML GENERATION
export async function exportElementAsImage(element: HTMLElement, filename: string = 'encarte.jpg'): Promise<void> {
  console.log('🎯 DIRECT CAPTURE with DOM-TO-IMAGE - Starting image export without HTML generation');
  
  try {
    // Wait for fonts and any pending renders
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Increased wait time
    
    // Check if we have multiple flyers
    const flyerPages = getFlyerPages(element);
    const isMultipleFlyers = flyerPages.length > 1;
    
    if (isMultipleFlyers) {
      console.log(`📄 Multiple flyers detected: ${flyerPages.length} pages`);
      
      // Export each flyer page as a separate image
      for (let i = 0; i < flyerPages.length; i++) {
        const pageElement = flyerPages[i];
        const pageNumber = i + 1;
        const pageFilename = filename.replace('.jpg', `-page-${pageNumber}.jpg`);
        
        console.log(`📸 Exporting flyer page ${pageNumber}`);
        await exportSingleFlyerAsImage(pageElement, pageFilename);
      }
      
      console.log('🎉 All flyer pages exported successfully');
      return;
    }
    
    // Single flyer export (original logic)
    await exportSingleFlyerAsImage(element, filename);
    
  } catch (error) {
    console.error('❌ Error in dom-to-image capture:', error);
    throw error;
  }
}

// Export a single flyer as image
async function exportSingleFlyerAsImage(element: HTMLElement, filename: string): Promise<void> {
  // Store current scroll position
  const scrollPosition = window.scrollY;
  const scrollXPosition = window.scrollX;
  
  // Create a hidden container for export to prevent scroll issues
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
  
  // Clone the element to avoid DOM manipulation
  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.cssText = `
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    transform: none;
    position: relative;
    top: 0;
    left: 0;
  `;
  
  // Add to hidden container
  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);
  
  try {
    // Get clean flyer content for export
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];
    
    // Debug: Log all price elements to see what's in the DOM
    const priceElements = exportElement.querySelectorAll('span[style*="color: #e7010f"]');
    console.log('🔍 Price elements found:', priceElements.length);
    priceElements.forEach((el, index) => {
      console.log(`Price ${index + 1}:`, el.textContent);
      console.log(`Price ${index + 1} data-price:`, el.getAttribute('data-price'));
    });
    
    // Additional debug: Check all spans with price data
    const allPriceSpans = exportElement.querySelectorAll('span[data-price]');
    console.log('🔍 All price spans found:', allPriceSpans.length);
    allPriceSpans.forEach((el, index) => {
      console.log(`Price span ${index + 1}:`, el.textContent, '- data-price:', el.getAttribute('data-price'));
    });
    
    console.log('📸 Capturing cloned element with dom-to-image:', exportElement);
    
    // A4 DIMENSIONS - Standard paper size
    const A4_WIDTH_PX = 2480;  // A4 width at 300 DPI (210mm)
    const A4_HEIGHT_PX = 3508; // A4 height at 300 DPI (297mm)
    
    // Calculate scale factors to fill A4 completely
    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to fill completely
    
    console.log('📏 A4 scaling calculation:', {
      elementWidth: exportElement.offsetWidth,
      elementHeight: exportElement.offsetHeight,
      A4_WIDTH: A4_WIDTH_PX,
      A4_HEIGHT: A4_HEIGHT_PX,
      scaleX: scaleX,
      scaleY: scaleY,
      finalScale: scale
    });
    
    const dataUrl = await domtoimage.toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,   // Target A4 width
      height: A4_HEIGHT_PX, // Target A4 height
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px'
      }
    });

    console.log('✅ Data URL created with dom-to-image');

    // Download immediately
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('🎉 Image exported successfully with dom-to-image:', filename);
  } finally {
    // Clean up hidden container
    document.body.removeChild(exportContainer);
    
    // Ensure scroll position is maintained
    requestAnimationFrame(() => {
      window.scrollTo(scrollXPosition, scrollPosition);
    });
  }
}

// DIRECT CAPTURE WITH DOM-TO-IMAGE - NO HTML GENERATION
export async function exportElementAsPDF(element: HTMLElement, filename: string = 'encarte.pdf'): Promise<void> {
  console.log('🎯 DIRECT CAPTURE with DOM-TO-IMAGE - Starting PDF export without HTML generation');
  
  try {
    // Wait for fonts and any pending renders
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Increased wait time
    
    // Check if we have multiple flyers
    const flyerPages = getFlyerPages(element);
    const isMultipleFlyers = flyerPages.length > 1;
    
    if (isMultipleFlyers) {
      console.log(`📄 Multiple flyers detected: ${flyerPages.length} pages`);
      
      // Create a single PDF with multiple pages
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Export each flyer page and add to PDF
      for (let i = 0; i < flyerPages.length; i++) {
        const pageElement = flyerPages[i];
        
        if (i > 0) {
          pdf.addPage(); // Add new page for each flyer after the first
        }
        
        console.log(`📸 Adding flyer page ${i + 1} to PDF`);
        await addFlyerPageToPDF(pdf, pageElement);
      }
      
      pdf.save(filename);
      console.log('🎉 Multi-page PDF exported successfully');
      return;
    }
    
    // Single flyer export (original logic)
    await exportSingleFlyerAsPDF(element, filename);
    
  } catch (error) {
    console.error('❌ Error in dom-to-image PDF capture:', error);
    throw error;
  }
}

// Export a single flyer as PDF
async function exportSingleFlyerAsPDF(element: HTMLElement, filename: string): Promise<void> {
  // Store current scroll position
  const scrollPosition = window.scrollY;
  const scrollXPosition = window.scrollX;
  
  // Create a hidden container for export to prevent scroll issues
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
  
  // Clone the element to avoid DOM manipulation
  const clonedElement = element.cloneNode(true) as HTMLElement;
  clonedElement.style.cssText = `
    width: ${element.offsetWidth}px;
    height: ${element.offsetHeight}px;
    transform: none;
    position: relative;
    top: 0;
    left: 0;
  `;
  
  // Add to hidden container
  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);
  
  try {
    // Get clean flyer content for export
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];
    
    // Debug: Log all price elements to see what's in the DOM
    const priceElements = exportElement.querySelectorAll('span[style*="color: #e7010f"]');
    console.log('🔍 PDF Price elements found:', priceElements.length);
    priceElements.forEach((el, index) => {
      console.log(`PDF Price ${index + 1}:`, el.textContent);
      console.log(`PDF Price ${index + 1} data-price:`, el.getAttribute('data-price'));
    });
    
    console.log('📸 Capturing cloned element for PDF with dom-to-image:', exportElement);
    
    // A4 DIMENSIONS - Standard paper size for PDF
    const A4_WIDTH_PX = 2480;  // A4 width at 300 DPI (210mm)
    const A4_HEIGHT_PX = 3508; // A4 height at 300 DPI (297mm)
    
    // Calculate scale factors to fill A4 completely
    const scaleX = A4_WIDTH_PX / exportElement.offsetWidth;
    const scaleY = A4_HEIGHT_PX / exportElement.offsetHeight;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to fill completely
    
    console.log('📏 A4 PDF scaling calculation:', {
      elementWidth: exportElement.offsetWidth,
      elementHeight: exportElement.offsetHeight,
      A4_WIDTH: A4_WIDTH_PX,
      A4_HEIGHT: A4_HEIGHT_PX,
      scaleX: scaleX,
      scaleY: scaleY,
      finalScale: scale
    });
    
    const dataUrl = await domtoimage.toJpeg(exportElement, {
      quality: 0.95,
      width: A4_WIDTH_PX,   // Target A4 width
      height: A4_HEIGHT_PX, // Target A4 height
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: exportElement.offsetWidth + 'px',
        height: exportElement.offsetHeight + 'px'
      }
    });

    console.log('✅ Data URL created with dom-to-image');

    // Create PDF directly from dom-to-image data
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Since we're capturing at A4 dimensions, use full PDF page
    const imgWidth = pdfWidth;
    const imgHeight = pdfHeight;
    const x = 0; // No centering needed - use full page
    const y = 0;

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
    pdf.save(filename);
    
    console.log('🎉 PDF exported successfully with dom-to-image:', filename);
  } finally {
    // Clean up hidden container
    document.body.removeChild(exportContainer);
    
    // Ensure scroll position is maintained
    requestAnimationFrame(() => {
      window.scrollTo(scrollXPosition, scrollPosition);
    });
  }
}

// Add a flyer page to an existing PDF
async function addFlyerPageToPDF(pdf: jsPDF, pageElement: HTMLElement): Promise<void> {
  // Create a hidden container for export to prevent scroll issues
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
  
  // Clone the element to avoid DOM manipulation
  const clonedElement = pageElement.cloneNode(true) as HTMLElement;
  clonedElement.style.cssText = `
    width: ${pageElement.offsetWidth}px;
    height: ${pageElement.offsetHeight}px;
    transform: none;
    position: relative;
    top: 0;
    left: 0;
  `;
  
  // Add to hidden container
  exportContainer.appendChild(clonedElement);
  document.body.appendChild(exportContainer);
  
  try {
    // Get clean flyer content for export
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];
    
    // A4 DIMENSIONS - Standard paper size for PDF
    const A4_WIDTH_PX = 2480;  // A4 width at 300 DPI (210mm)
    const A4_HEIGHT_PX = 3508; // A4 height at 300 DPI (297mm)
    
    // Calculate scale factors to fill A4 completely
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
        height: exportElement.offsetHeight + 'px'
      }
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Use full PDF page
    const imgWidth = pdfWidth;
    const imgHeight = pdfHeight;
    const x = 0;
    const y = 0;

    pdf.addImage(dataUrl, 'JPEG', x, y, imgWidth, imgHeight);
  } finally {
    // Clean up hidden container
    document.body.removeChild(exportContainer);
  }
}

// Helper: generate the standalone HTML string for the flyer
export async function generateFlyerExportHTML(flyerElement: HTMLElement): Promise<string> {
  // Clone the flyer node
  const clone = flyerElement.cloneNode(true) as HTMLElement;

  // Inline all images as Base64
  const imgElements = clone.querySelectorAll('img');
  const toDataURL = (img: HTMLImageElement) => new Promise<string>((resolve) => {
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

  // Collect all CSS from <style> and <link rel="stylesheet">
  let cssText = '';
  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      if (styleSheet.href && styleSheet.href.startsWith('http') && !styleSheet.href.includes(window.location.host)) continue;
      const rules = styleSheet.cssRules;
      for (const rule of Array.from(rules)) {
        cssText += rule.cssText + '\n';
      }
    } catch {
      // Ignore CORS issues
    }
  }

  cssText += `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');\n`;

  // Build the HTML with enhanced styling
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1240, initial-scale=1.0" />
<title>Flyer Export</title>
<style>
${cssText}
    /* Export-specific styles */
    html, body { 
      height: 100%; 
      margin: 0; 
      padding: 0; 
      background: #eee; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
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
    
    /* Ensure all critical styles are applied */
    .truncate { 
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
  // Log to console
  console.log(html);
  // Open preview
  const preview = window.open();
  if (preview) {
    preview.document.open();
    preview.document.write(html);
    preview.document.close();
  }
  // Trigger download
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
  // Legacy function - redirects to new dom-to-image method
  console.log('Legacy HTML export called - redirecting to dom-to-image direct capture');
  return await exportElementAsImage(flyerElement, filename);
}

export async function exportFlyerHTMLAsPDF(flyerElement: HTMLElement, filename: string = 'encarte.pdf') {
  // Legacy function - redirects to new dom-to-image method
  console.log('Legacy HTML PDF export called - redirecting to dom-to-image direct capture');
  return await exportElementAsPDF(flyerElement, filename);
} 