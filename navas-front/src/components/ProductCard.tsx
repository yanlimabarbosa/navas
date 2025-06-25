import React from 'react';
import { ProductGroup, Product } from '../types';

interface ProductCardProps {
  group: ProductGroup;
  isPreview?: boolean;
}

// Helper para formatar o preço de forma consistente
export const formatPrice = (price: number) => {
  const [intPart, decimal] = price.toFixed(2).split(".");

  return (
      <span className="text-lg font-bold" style={{ color: "#e7010f" }}>
        {`R$ ${intPart}`}
        {decimal !== "00" && `,${decimal}`}
      </span>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ group, isPreview = false }) => {
  const imageHeight = 'h-[110px]';

  const PriceTag = ({ children }: { children: React.ReactNode }) => (
    <div
      className="flex items-center justify-center bg-yellow-400 text-black text-center rounded-md mt-2"
      style={{ height: '40px', minHeight: '40px', maxHeight: '40px', fontWeight: 700 }}
    >
      {children}
    </div>
  );

  const ImageSection = () => (
    <div className={`w-full ${imageHeight} flex items-center justify-center`}>
      {group.image ? (
        <img 
          src={group.image.startsWith('/') ? group.image.slice(1) : group.image}
          alt={group.title || group.products[0]?.description || 'Imagem do produto'} 
          className="h-full w-auto object-contain"
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
    const title = group.groupType === 'single' ? group.products[0]?.description : group.title;
    return (
      <h3 className="text-xs font-semibold text-gray-800 text-center leading-tight mb-2">
        {title}
      </h3>
    );
  };

  const renderSingleProduct = (product: Product) => (
    <>
      <ImageSection />
      <div className="flex-1 flex flex-col">
        <TitleSection />
        <p className="text-xs font-bold text-gray-600 text-center mb-2">Cód. {product.code}</p>
      </div>
      <PriceTag>{formatPrice(product.price)}</PriceTag>
    </>
  );

  const renderSamePriceGroup = () => (
    <>
      <ImageSection />
      <div className="flex-1 flex flex-col">
        <TitleSection />
        <div className="text-center space-y-1 mb-2">
          {group.products.slice(0, 3).map(p => (
            <div key={p.id} className="text-xs text-gray-700">
              <span className="font-bold">{p.specifications}</span> - <span className="font-medium">Cód. {p.code}</span>
            </div>
          ))}
        </div>
      </div>
      <PriceTag>{formatPrice(group.products[0].price)}</PriceTag>
    </>
  );
  
  const renderDifferentPriceGroup = () => (
    <>
      <ImageSection />
      <div className="flex-1 flex flex-col">
        <div className="space-y-1.5 mb-2">
          {group.products.slice(0, 3).map(p => (
            <div key={p.id} className="flex flex-col justify-between items-center text-xs border-b border-gray-100 last:border-b-0 pb-1">
              <div className="font-semibold text-gray-700">{p.specifications}</div>
              <div className="bg-gray-200 px-2 py-0.5 rounded-full text-black font-bold whitespace-nowrap">
                R$ {p.price.toFixed(2).replace('.', ',')}
              </div>
            </div>
          ))}
        </div>
        <TitleSection />
      </div>
    </>
  );

  const renderContent = () => {
    if (!group) return null;

    switch (group.groupType) {
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
    <div className="bg-white border-2 border-gray-100 w-full h-full flex flex-col p-2 shadow-sm rounded-lg">
      {renderContent()}
    </div>
  );
};