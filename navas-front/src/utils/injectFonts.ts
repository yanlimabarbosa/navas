import { ANTON_FONT_BASE64 } from '@/fonts/anton.base64';

export function injectExportFonts(container: HTMLElement) {
  const style = document.createElement('style');
  style.setAttribute('data-export-font', 'anton');
  style.innerHTML = `
    ${ANTON_FONT_BASE64}

    * {
      font-family: 'Anton', sans-serif !important;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;
  container.prepend(style);
}
