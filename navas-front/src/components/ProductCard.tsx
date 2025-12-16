import React from 'react';
import { ProductGroup, Product, FlyerConfig } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

const productTitleClass =
  'text-[13px] font-bold text-[#f0f0f0] text-center leading-tight uppercase tracking-tight break-words w-full bg-[#003169] py-3';

const PriceDisplay = ({
  price,
  priceColor,
  priceBackgroundColor,
  align = 'center',
}: {
  price: number;
  priceColor: string;
  priceBackgroundColor: string;
  align?: 'center' | 'right';
}) => {
  const formattedPrice = (price ?? 0).toFixed(2).replace('.', ',');
  const fullPriceText = `${formattedPrice}`;

  return (
    <span
      className="flex gap-1 p-2  items-center text-xl font-black nowrap min-w-[90px] h-full relative rounded-tr-3xl rounded-bl-3xl"
      style={{
        textAlign: align,
        color: priceColor,
        backgroundColor: priceBackgroundColor,
        fontFamily: 'Anton, sans-serif',
      }}
      data-price={fullPriceText}
    >
      <span className="text-[22px]  top-0 mb-4">R$ </span>
      <div>
        <span className="text-[42px]">{fullPriceText.split(',')[0]}</span>
        <span className="text-[22px]">,{fullPriceText.split(',')[1]}</span>
      </div>
    </span>
  );
};

const ImageBlock = ({ src, alt }: { src?: string; alt: string }) => {
  const imagePath = src ? ImageProcessor.getImagePath(src) : undefined;

  return (
    <div className="w-full aspect-square rounded-md p-1 flex items-center justify-center max-w-[195px] mx-auto">
      {imagePath ? (
        <img src={imagePath} alt={alt} className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full flex items-center justify-center rounded-[4px]">
          <span className="text-[10px] text-gray-400">Sem Imagem</span>
        </div>
      )}
    </div>
  );
};

interface ProductCardProps {
  group: ProductGroup;
}

export const ProductCard: React.FC<ProductCardProps & { config: FlyerConfig }> = ({ group, config }) => {
  const priceColor = config.priceColor;
  const priceBackgroundColor = config.priceBackgroundColor;
  const renderSingleProduct = (product: Product) => (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-white">
      <h3 className={productTitleClass}>{product.description}</h3>
      <div className="bg-[#00579F] text-white text-[13px] text-center font-bold">{product.code}</div>
      <div className="relative flex-1 flex items-center justify-center min-h-[100px] h-full">
        <ImageBlock src={group.image} alt={group.title ?? product.description ?? 'Imagem do produto'} />
      </div>

      <div className="flex items-center pb-4 pl-2 relative">
        <div
          className="flex items-center justify-center  text-center h-[70px] rounded-tr-3xl rounded-bl-3xl z-30 absolute bottom-2"
          style={{
            minHeight: '35px',
            backgroundColor: priceBackgroundColor,
          }}
        >
          <PriceDisplay price={product.price} priceColor={priceColor} priceBackgroundColor={priceBackgroundColor} />
        </div>
      </div>
    </div>
  );

  const renderSamePriceGroup = () => (
    <div className="flex flex-col flex-1 h-full rounded-3xl overflow-hidden bg-white">
      <h3 className={productTitleClass}>{group.title}</h3>
      <div className="flex-1 flex items-center justify-center min-h-[100px] h-full p-2">
        <ImageBlock src={group.image} alt={group.title ?? group.products[0]?.description ?? 'Imagem do produto'} />
      </div>

      {/* Container do preço e códigos */}
      <div className="flex w-full px-2 pb-2 gap-2 h-auto">
        {/* Preço - lado esquerdo */}
        <div className="flex-shrink-0">
          <span
            className="flex gap-1 p-2 items-center font-black rounded-br-3xl rounded-tr-lg"
            style={{
              color: config.priceColor,
              backgroundColor: config.priceBackgroundColor,
              fontFamily: 'Anton, sans-serif',
              borderRadius: '0px 16px 0px 16px',
            }}
          >
            <span className="text-[16px]">R$ </span>
            <div>
              <span className="text-[28px]">{(group.products[0].price ?? 0).toFixed(2).replace('.', ',').split(',')[0]}</span>
              <span className="text-[14px]">,{(group.products[0].price ?? 0).toFixed(2).replace('.', ',').split(',')[1]}</span>
            </div>
          </span>
        </div>

        {/* Códigos - lado direito */}
        <div className="flex flex-col gap-0.5 flex-1">
          {group.products.slice(0, 6).map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center h-[22px] px-1 text-[10px] min-w-0 ${
                i % 2 !== 0 ? 'bg-[#00569F]' : 'bg-[#002F68]'
              }`}
            >
              <span className="text-white font-bold truncate">
                {p.code}
              </span>
              {p.specifications && (
                <span className="text-[#f3f0f0] font-light ml-0.5 truncate">
                  - {p.specifications}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDifferentPriceGroup = () => {
    const count = group.products.length;
    let priceFont = 'text-[15px]';
    let rowHeight = 'h-[28px]';
    let descFont = 'text-[13px]';

    if (count >= 6) {
      priceFont = 'text-[13px]';
      rowHeight = 'h-[24px]';
      descFont = 'text-[12px]';
    } else if (count === 5) {
      priceFont = 'text-[14px]';
      rowHeight = 'h-[26px]';
      descFont = 'text-[12px]';
    }

    return (
      <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-white">
        <h3 className={productTitleClass}>{group.title}</h3>
        <div className="relative flex items-center justify-center min-h-[100px] h-full flex-1 p-2">
          <ImageBlock src={group.image} alt={group.title ?? group.products[0]?.description ?? 'Imagem do produto'} />
        </div>

        <div className={`flex flex-col w-full px-2 pb-2`}>
          {group.products.slice(0, 6).map((p, i) => (
            <div
              key={p.id}
              className={`flex ${rowHeight} items-center overflow-hidden  ${
                i % 2 !== 0 ? 'bg-[#00569F]' : 'bg-[#002F68]'
              }`}
            >
              <div className="flex items-center  pl-2 pr-2 flex-1 ">
                <span className={`text-white font-bold text-left whitespace-nowrap ${descFont}`}>{p.code}</span>
                <span className={`text-[#f5f3f3] font-light text-center w-full ${descFont}`}>{p.specifications}</span>
              </div>
              <div
                className={`flex items-center justify-center rounded-tr-3xl rounded-bl-3xl ${
                  i % 2 === 0 ? 'bg-yellow-400' : 'bg-yellow-500'
                } px-2 h-full min-w-24`}
              >
                <span
                  className={`font-black text-[#002F68] ${priceFont}`}
                  style={{
                    letterSpacing: '-0.025em',
                    display: 'inline-block',
                    whiteSpace: 'nowrap',
                    textAlign: 'center',
                    fontFamily: 'Anton, sans-serif',
                  }}
                  data-price={`R$ ${(p.price ?? 0).toFixed(2).replace('.', ',')}`}
                >
                  {`R$ ${(p.price ?? 0).toFixed(2).replace('.', ',')}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  return <>{renderContent()}</>;
};
