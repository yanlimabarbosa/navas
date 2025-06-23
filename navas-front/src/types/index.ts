export interface Product {
  id: string;
  code: string;
  description?: string;
  price: number;
  category?: string;
  specifications?: string;
}

export interface ProductGroup {
  id: string;
  type: 'single' | 'same-price' | 'different-price';
  title?: string;
  image?: string;
  products: Product[];
  position: number;
}

export interface FlyerConfig {
  id: string;
  title: string;
  headerText: string;
  footerText: string;
  headerImageUrl?: string;
  footerImageUrl?: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: Date;
  updatedAt: Date;
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
  height: 474
};

export const FOOTER_DIMENSIONS: ImageDimensions = {
  width: 1240,
  height: 204
};