import { ProductGroup, FlyerConfig } from '../types';

// Mock data for the flyer configuration
export const mockConfig: FlyerConfig = {
  id: 'config-1',
  title: 'Encarte de Ofertas',
  backgroundColor: '#FFFFFF',
  primaryColor: '#d91e2b',
  secondaryColor: '#2b3990',
  priceColor: '#ffffff',
  priceBackgroundColor: '#00569F',
  createdAt: new Date(),
  updatedAt: new Date(),
  headerImageUrl: '',
  footerImageUrl: '',
};

// Mock data for the product groups, reflecting the Excel structure
export const mockGroups: ProductGroup[] = [
  // 1. Produto Único (Estilete)
  {
    id: 'group-1',
    type: 'single',
    position: 1,
    image: 'image.png', // Imagem da pasta /public
    products: [
      {
        id: 'prod-101',
        code: '1408176',
        description: 'ESTILETE 1-TOI STANDARD LARCO 18MM',
        price: 2.29,
      },
    ],
  },

  // 2. Produtos com Preços Diferentes (Trena)
  {
    id: 'group-2',
    type: 'different-price',
    position: 2,
    title: 'TRENA 1-TOI C/ TRAVA',
    image: 'image copy.png', // Imagem da pasta /public
    products: [
      {
        id: 'prod-201',
        code: '1408177',
        specifications: '3MX16MM',
        price: 6.69,
      },
      {
        id: 'prod-202',
        code: '1401849',
        specifications: '5MX19MM',
        price: 9.75,
      },
      {
        id: 'prod-203',
        code: '1406500',
        specifications: '7,5X25MM',
        price: 18.99,
      },
    ],
  },

  // 3. Produtos com o Mesmo Preço (Palha de Aço)
  {
    id: 'group-3',
    type: 'same-price',
    position: 3,
    title: 'PALHA ACO 1-TOI 22G-PCT 20',
    image: 'image.png', // Imagem da pasta /public
    products: [
      {
        id: 'prod-301',
        code: '1406502',
        specifications: 'NO',
        price: 26.59,
      },
      {
        id: 'prod-302',
        code: '1406503',
        specifications: 'N1',
        price: 26.59,
      },
      {
        id: 'prod-303',
        code: '1406504',
        specifications: 'N2',
        price: 26.59,
      },
    ],
  },
];
