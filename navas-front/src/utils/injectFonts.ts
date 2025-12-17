import { ANTON_FONT_BASE64 } from '@/fonts/anton.base64';

export function injectExportFonts(container: HTMLElement) {
  const style = document.createElement('style');
  style.setAttribute('data-export-font', 'anton');
  
  // Add a specific class to the container to ensure specificity
  container.classList.add('font-injection-target');
  
  style.innerHTML = `
    ${ANTON_FONT_BASE64}

    .font-injection-target * {
      font-family: 'Anton', sans-serif !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;
  container.prepend(style);
}
