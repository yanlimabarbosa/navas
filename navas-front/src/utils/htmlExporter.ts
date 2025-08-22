import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const flyerPages = getFlyerPages(element);
    const isMultipleFlyers = flyerPages.length > 1;
    
    if (isMultipleFlyers) {
      for (let i = 0; i < flyerPages.length; i++) {
        const pageElement = flyerPages[i];
        const pageNumber = i + 1;
        const pageFilename = filename.replace('.jpg', `-page-${pageNumber}.jpg`);
        
        await exportSingleFlyerAsImage(pageElement, pageFilename);
      }
      
      return;
    }
    
    await exportSingleFlyerAsImage(element, filename);
}

async function exportSingleFlyerAsImage(element: HTMLElement, filename: string): Promise<void> {
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
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];
    
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
        height: exportElement.offsetHeight + 'px'
      }
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const flyerPages = getFlyerPages(element);
    const isMultipleFlyers = flyerPages.length > 1;
    
    if (isMultipleFlyers) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
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
    const cleanContent = getCleanFlyerContent(clonedElement);
    const exportElement = cleanContent[0];
    
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
        height: exportElement.offsetHeight + 'px'
      }
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
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

  let cssText = '';
  for (const styleSheet of Array.from(document.styleSheets)) {
    try {
      if (styleSheet.href && styleSheet.href.startsWith('http') && !styleSheet.href.includes(window.location.host)) continue;
      const rules = styleSheet.cssRules;
      for (const rule of Array.from(rules)) {
        cssText += rule.cssText + '\n';
      }
    } catch {
      console.log("error");
    }
  }

  cssText += `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');\n`;

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