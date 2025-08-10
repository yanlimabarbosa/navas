import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

// DIRECT CAPTURE WITH DOM-TO-IMAGE - NO HTML GENERATION
export async function exportElementAsImage(element: HTMLElement, filename: string = 'encarte.jpg'): Promise<void> {
  console.log('🎯 DIRECT CAPTURE with DOM-TO-IMAGE - Starting image export without HTML generation');
  
  try {
    // Wait for fonts and any pending renders
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Increased wait time
    
    // Force DOM update and debugging
    element.style.display = 'none';
    void element.offsetHeight; // Force reflow
    element.style.display = '';
    void element.offsetHeight; // Force reflow again
    
    // Debug: Log all price elements to see what's in the DOM
    const priceElements = element.querySelectorAll('span[style*="color: #e7010f"]');
    console.log('🔍 Price elements found:', priceElements.length);
    priceElements.forEach((el, index) => {
      console.log(`Price ${index + 1}:`, el.textContent);
      console.log(`Price ${index + 1} data-price:`, el.getAttribute('data-price'));
    });
    
    // Additional debug: Check all spans with price data
    const allPriceSpans = element.querySelectorAll('span[data-price]');
    console.log('🔍 All price spans found:', allPriceSpans.length);
    allPriceSpans.forEach((el, index) => {
      console.log(`Price span ${index + 1}:`, el.textContent, '- data-price:', el.getAttribute('data-price'));
    });
    
    console.log('📸 Capturing element directly with dom-to-image:', element);
    
    // A4 DIMENSIONS - Standard paper size
    const A4_WIDTH_PX = 2480;  // A4 width at 300 DPI (210mm)
    const A4_HEIGHT_PX = 3508; // A4 height at 300 DPI (297mm)
    
    // Calculate scale factors to fill A4 completely
    const scaleX = A4_WIDTH_PX / element.offsetWidth;
    const scaleY = A4_HEIGHT_PX / element.offsetHeight;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to fill completely
    
    console.log('📏 A4 scaling calculation:', {
      elementWidth: element.offsetWidth,
      elementHeight: element.offsetHeight,
      A4_WIDTH: A4_WIDTH_PX,
      A4_HEIGHT: A4_HEIGHT_PX,
      scaleX: scaleX,
      scaleY: scaleY,
      finalScale: scale
    });
    
    const dataUrl = await domtoimage.toJpeg(element, {
      quality: 0.95,
      width: A4_WIDTH_PX,   // Target A4 width
      height: A4_HEIGHT_PX, // Target A4 height
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: element.offsetWidth + 'px',
        height: element.offsetHeight + 'px'
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
  } catch (error) {
    console.error('❌ Error in dom-to-image capture:', error);
    throw error;
  }
}

// DIRECT CAPTURE WITH DOM-TO-IMAGE - NO HTML GENERATION
export async function exportElementAsPDF(element: HTMLElement, filename: string = 'encarte.pdf'): Promise<void> {
  console.log('🎯 DIRECT CAPTURE with DOM-TO-IMAGE - Starting PDF export without HTML generation');
  
  try {
    // Wait for fonts and any pending renders
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Increased wait time
    
    // Force DOM update and debugging
    element.style.display = 'none';
    void element.offsetHeight; // Force reflow
    element.style.display = '';
    void element.offsetHeight; // Force reflow again
    
    // Debug: Log all price elements to see what's in the DOM
    const priceElements = element.querySelectorAll('span[style*="color: #e7010f"]');
    console.log('🔍 PDF Price elements found:', priceElements.length);
    priceElements.forEach((el, index) => {
      console.log(`PDF Price ${index + 1}:`, el.textContent);
      console.log(`PDF Price ${index + 1} data-price:`, el.getAttribute('data-price'));
    });
    
    console.log('📸 Capturing element directly for PDF with dom-to-image:', element);
    
    // A4 DIMENSIONS - Standard paper size for PDF
    const A4_WIDTH_PX = 2480;  // A4 width at 300 DPI (210mm)
    const A4_HEIGHT_PX = 3508; // A4 height at 300 DPI (297mm)
    
    // Calculate scale factors to fill A4 completely
    const scaleX = A4_WIDTH_PX / element.offsetWidth;
    const scaleY = A4_HEIGHT_PX / element.offsetHeight;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to fill completely
    
    console.log('📏 A4 PDF scaling calculation:', {
      elementWidth: element.offsetWidth,
      elementHeight: element.offsetHeight,
      A4_WIDTH: A4_WIDTH_PX,
      A4_HEIGHT: A4_HEIGHT_PX,
      scaleX: scaleX,
      scaleY: scaleY,
      finalScale: scale
    });
    
    const dataUrl = await domtoimage.toJpeg(element, {
      quality: 0.95,
      width: A4_WIDTH_PX,   // Target A4 width
      height: A4_HEIGHT_PX, // Target A4 height
      bgcolor: '#ffffff',
      style: {
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
        width: element.offsetWidth + 'px',
        height: element.offsetHeight + 'px'
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
  } catch (error) {
    console.error('❌ Error in dom-to-image PDF capture:', error);
    throw error;
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