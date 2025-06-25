import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    } catch (e) {
      // Ignore CORS issues
    }
  }

  cssText += `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');\n`;

  // Build the HTML
  const html = `<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"UTF-8\" />\n<meta name=\"viewport\" content=\"width=794, initial-scale=1.0\" />\n<title>Flyer Export</title>\n<style>${cssText}
    html, body { height: 100%; margin: 0; padding: 0; background: #eee; }
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; box-sizing: border-box; }
    #flyer-export { width: 794px; background: #fff; box-shadow: 0 0 24px #0002; display: flex; flex-direction: column; overflow: hidden; position: relative; }
    @media print { html, body { background: #fff !important; width: 210mm; height: 297mm; margin: 0; padding: 0; } #flyer-export { width: 210mm; box-shadow: none !important; margin: 0 !important; page-break-after: avoid; } }
  </style>\n</head>\n<body>\n<div id=\"flyer-export\">${clone.outerHTML}</div>\n</body>\n</html>`;
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

export async function exportFlyerHTMLAsImage(flyerElement: HTMLElement, filename: string = 'encarte.jpg', html?: string) {
  if (!html) html = await generateFlyerExportHTML(flyerElement);
  // Create an offscreen iframe to render the HTML
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '820px';
  iframe.style.height = '1200px';
  document.body.appendChild(iframe);
  // Set srcdoc and robustly wait for content to be ready
  iframe.srcdoc = html;
  await new Promise((resolve) => setTimeout(resolve, 100));
  let flyerDiv = null;
  for (let i = 0; i < 30; i++) { // up to ~3s
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      flyerDiv = iframe.contentDocument.getElementById('flyer-export');
      if (flyerDiv) break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!flyerDiv) {
    console.error('Flyer div not found in iframe for image export');
    document.body.removeChild(iframe);
    return;
  }
  await new Promise(r => setTimeout(r, 500));
  await (iframe.contentDocument as Document).fonts?.ready;
  // Use html2canvas to capture the flyer
  const canvas = await html2canvas(flyerDiv, { useCORS: true, backgroundColor: '#fff', scale: 2 });
  // Download as image
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/jpeg', 0.95);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  document.body.removeChild(iframe);
}

export async function exportFlyerHTMLAsPDF(flyerElement: HTMLElement, filename: string = 'encarte.pdf', html?: string) {
  if (!html) html = await generateFlyerExportHTML(flyerElement);
  // Create an offscreen iframe to render the HTML
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '0';
  iframe.style.width = '820px';
  iframe.style.height = '1200px';
  document.body.appendChild(iframe);
  // Set srcdoc and robustly wait for content to be ready
  iframe.srcdoc = html;
  await new Promise((resolve) => setTimeout(resolve, 100));
  let flyerDiv = null;
  for (let i = 0; i < 30; i++) { // up to ~3s
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      flyerDiv = iframe.contentDocument.getElementById('flyer-export');
      if (flyerDiv) break;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  if (!flyerDiv) {
    console.error('Flyer div not found in iframe for PDF export');
    document.body.removeChild(iframe);
    return;
  }
  await new Promise(r => setTimeout(r, 500));
  await (iframe.contentDocument as Document).fonts?.ready;
  // Use html2canvas to capture the flyer
  const canvas = await html2canvas(flyerDiv, { useCORS: true, backgroundColor: '#fff', scale: 2 });
  // Prepare PDF
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = 210; // mm (A4 width)
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const y = (pdfHeight - imgHeight) / 2;
  pdf.addImage(imgData, 'JPEG', 0, y, imgWidth, imgHeight);
  pdf.save(filename);
  document.body.removeChild(iframe);
} 