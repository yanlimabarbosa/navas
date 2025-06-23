import React from 'react';
import { ProductGroup, Product } from '../types';

interface ProductCardProps {
  group: ProductGroup;
  isPreview?: boolean;
}

// Helper para formatar o preço de forma consistente
const formatPrice = (price: number) => {
  const parts = price.toFixed(2).split('.');
  return (
    <>
      <span className="text-sm font-medium">R$</span>
      <span className="text-2xl font-bold">{parts[0]}</span>
      <span className="text-sm font-bold">,{parts[1]}</span>
    </>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ group, isPreview = false }) => {
  // Renderiza a área da imagem
  const ImageSection = () => (
    <div className="w-full h-32 mb-2 flex items-center justify-center overflow-hidden">
      {group.image ? (
        <img 
          src={`/${group.image}`} 
          alt={group.title || group.products[0]?.description || 'Imagem do produto'} 
          className="max-w-full max-h-full object-contain"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs text-gray-400">Sem Imagem</span>
        </div>
      )}
    </div>
  );

  // Renderiza a descrição principal do card
  const TitleSection = () => {
    const title = group.type === 'single' ? group.products[0]?.description : group.title;
    return (
      <h3 className="text-sm font-semibold text-gray-800 text-center leading-tight mb-2 flex-grow line-clamp-3">
        {title}
      </h3>
    );
  };

  const renderSingleProduct = (product: Product) => (
    <>
      <ImageSection />
      <div className="flex flex-col flex-grow justify-end">
        <TitleSection />
        <p className="text-xs font-bold text-gray-600 text-center mb-2">Cód. {product.code}</p>
        <div className="bg-yellow-400 text-black text-center py-1 rounded-md">
          {formatPrice(product.price)}
        </div>
      </div>
    </>
  );

  const renderSamePriceGroup = () => (
    <>
      <ImageSection />
      <div className="flex flex-col flex-grow justify-end">
        <TitleSection />
        <div className="text-center space-y-1 mb-2">
          {group.products.slice(0, 3).map(p => (
            <div key={p.id} className="text-xs text-gray-700">
              <span className="font-bold">{p.specifications}</span> - <span className="font-medium">Cód. {p.code}</span>
            </div>
          ))}
        </div>
        <div className="bg-yellow-400 text-black text-center py-1 rounded-md mt-auto">
          {formatPrice(group.products[0].price)}
        </div>
      </div>
    </>
  );
  
  const renderDifferentPriceGroup = () => (
    <>
      <ImageSection />
      <div className="flex flex-col flex-grow justify-end">
        <TitleSection />
        <div className="space-y-1.5 mb-2">
          {group.products.slice(0, 3).map(p => (
            <div key={p.id} className="flex justify-between items-center text-xs border-b border-gray-100 last:border-b-0 pb-1">
              <span className="font-semibold text-gray-700">{p.specifications}</span>
              <span className="bg-gray-200 px-2 py-0.5 rounded-full text-black font-bold whitespace-nowrap">
                R$ {p.price.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderContent = () => {
    if (!group) return null;

    switch (group.type) {
      case 'single':
        return renderSingleProduct(group.products[0]);
      case 'same-price':
        return renderSamePriceGroup();
      case 'different-price':
        return renderDifferentPriceGroup();
      default:
        return <div className="text-xs text-red-500">Tipo de grupo inválido</div>;
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-100 p-2 h-full w-full flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-200">
      {renderContent()}
    </div>
  );
};