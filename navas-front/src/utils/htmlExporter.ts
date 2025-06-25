// Utility to export a flyer container as standalone HTML with embedded CSS and images
export async function exportFlyerAsHTML(flyerElement: HTMLElement, filename: string = 'encarte.html') {
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

  // Add Google Fonts if used
  cssText += `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');\n`;

  // Build the HTML
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=794, initial-scale=1.0" />
  <title>Flyer Export</title>
  <style>
    ${cssText}
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      background: #eee;
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    #flyer-export {
      width: 794px;
      height: auto;
      background: #fff;
      box-shadow: 0 0 24px #0002;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;
    }
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
        height: 297mm;
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
} 