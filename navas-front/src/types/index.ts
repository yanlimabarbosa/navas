export interface Product {
  id: string;
  code: string;
  description?: string;
  price: number;
  category?: string;
  specifications?: string;
}

export type ProductGroup = {
  id: string;
  title: string;
  image?: string;
  products: Product[];
  groupType: 'single' | 'same-price' | 'different-price';
  position: number;
  flyerPage?: number;
};

export interface FlyerConfig {
  id: string;
  title: string;
  headerText?: string;
  footerText?: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  priceColor: string;
  priceBackgroundColor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlyerPage {
  id: string;
  pageNumber: number;
  groups: ProductGroup[];
  config: FlyerConfig;
}

export interface SavedProject {
  id: string;
  name: string;
  config: FlyerConfig;
  groups: ProductGroup[];
  products: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExcelData {
  Posicao: number;
  Codigo: string;
  Descricao: string;
  Diferencial?: string;
  Preco: number;
  Imagem: string;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export const HEADER_DIMENSIONS: ImageDimensions = {
  width: 1240,
  height: 474,
};

export const FOOTER_DIMENSIONS: ImageDimensions = {
  width: 1240,
  height: 204,
};

export const QUADRANTS_PER_FLYER = 12;

// Electron API types
declare global {
  interface Window {
    electronAPI?: {
      getBackendUrl: () => Promise<string>;
      onBackendReady: (callback: () => void) => void;
      onBackendError: (callback: (error: string) => void) => void;
      onBackendStatus: (callback: (status: string) => void) => void;
    };
  }
}

export {};
