import React from 'react';
import { Package, DollarSign } from 'lucide-react';
import { Product, ProductGroup } from '../types';

interface ProductCardProps {
  group: ProductGroup;
  onEdit?: () => void;
  isPreview?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ group, onEdit, isPreview = false }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const renderSingleProduct = (product: Product) => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-3 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
      <div className="text-center mb-2">
        <div className="bg-gray-100 rounded-lg p-3 mb-2 min-h-[60px] flex items-center justify-center">
          <Package className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-xs font-bold text-gray-800 mb-1">Cód. {product.code}</p>
        <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-1 leading-tight">
          {product.description}
        </h3>
      </div>
      <div className="bg-yellow-400 text-black text-center py-2 rounded font-bold text-sm flex items-center justify-center">
        <span className="text-xs mr-1">R$</span>
        <span>{product.price.toFixed(2).replace('.', ',')}</span>
      </div>
    </div>
  );

  const renderSamePriceProducts = () => {
    const price = group.products[0]?.price || 0;
    const maxItems = Math.min(group.products.length, 4);
    
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-2 h-full flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
        <div className="text-center mb-2 flex-1">
          <div className="bg-gray-100 rounded-lg p-2 mb-2 min-h-[40px] flex items-center justify-center">
            <div className="grid grid-cols-2 gap-1">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-blue-300 rounded-sm" />
              ))}
            </div>
          </div>
          {group.title && (
            <h3 className="text-xs font-semibold text-gray-900 mb-1 leading-tight">{group.title}</h3>
          )}
          <div className="space-y-0.5 flex-1">
            {group.products.slice(0, maxItems).map((product, index) => (
              <div key={product.id} className="text-xs text-gray-700 leading-tight">
                <div className="font-medium">{product.code}</div>
                {product.specifications && (
                  <div className="text-gray-500 text-xs leading-tight">{product.specifications}</div>
                )}
              </div>
            ))}
            {group.products.length > maxItems && (
              <p className="text-xs text-gray-500">+{group.products.length - maxItems} mais</p>
            )}
          </div>
        </div>
        <div className="bg-yellow-400 text-black text-center py-2 rounded font-bold text-sm flex items-center justify-center mt-auto">
          <span className="text-xs mr-1">R$</span>
          <span>{price.toFixed(2).replace('.', ',')}</span>
        </div>
      </div>
    );
  };

  const renderDifferentPriceProducts = () => {
    const maxItems = Math.min(group.products.length, 3);
    
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-2 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
        <div className="text-center mb-2">
          <div className="bg-gray-100 rounded-lg p-2 mb-2 min-h-[30px] flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-1.5 h-1.5 bg-red-300 rounded-sm" />
              ))}
            </div>
          </div>
          {group.title && (
            <h3 className="text-xs font-semibold text-gray-900 mb-2 leading-tight">{group.title}</h3>
          )}
        </div>
        <div className="space-y-1 flex-1">
          {group.products.slice(0, maxItems).map((product) => (
            <div key={product.id} className="flex justify-between items-center text-xs border-b border-gray-100 pb-1">
              <div className="text-left flex-1 mr-1">
                <div className="font-medium text-xs leading-tight">{product.code}</div>
                {product.specifications && (
                  <div className="text-gray-500 text-xs leading-tight">{product.specifications}</div>
                )}
              </div>
              <div className="bg-yellow-300 px-1.5 py-0.5 rounded text-black font-bold text-xs whitespace-nowrap">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </div>
            </div>
          ))}
          {group.products.length > maxItems && (
            <p className="text-xs text-gray-500 text-center">+{group.products.length - maxItems} mais</p>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (group.type) {
      case 'single':
        return renderSingleProduct(group.products[0]);
      case 'same-price':
        return renderSamePriceProducts();
      case 'different-price':
        return renderDifferentPriceProducts();
      default:
        return renderSingleProduct(group.products[0]);
    }
  };

  return (
    <div 
      className={`relative group ${!isPreview ? 'cursor-pointer' : ''} h-full`}
      onClick={!isPreview ? onEdit : undefined}
    >
      {renderContent()}
      {!isPreview && (
        <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white rounded-full p-2 shadow-lg">
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
};