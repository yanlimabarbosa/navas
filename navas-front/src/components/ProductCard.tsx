import React from 'react';
import { ProductGroup, Product, FlyerConfig } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

const productTitleClass =
  'text-[13px] font-bold text-[#f0f0f0] text-center leading-tight uppercase tracking-tight break-words w-full bg-[#003169] py-3';

const PriceDisplay = ({
  price,
  priceColor,
  priceBackgroundColor,
}: {
  price: number;
  priceColor: string;
  priceBackgroundColor: string;
}) => {
  const formattedPrice = (price ?? 0).toFixed(2).replace('.', ',');
  const fullPriceText = `${formattedPrice}`;

  return (
    <span
      className="flex gap-1 px-2 items-center text-xl font-black nowrap min-w-[90px] h-full relative rounded-tr-3xl rounded-bl-3xl"
      style={{
        textAlign: 'center',
        color: priceColor,
        backgroundColor: priceBackgroundColor,
      }}
      data-price={fullPriceText}
    >
      <span className="text-[22px]  top-0 mb-4">R$ </span>
      <div>
        <span className="text-[42px]">{fullPriceText.split(',')[0]}</span>
        <span className="text-[14px]">,{fullPriceText.split(',')[1]}</span>
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

      <div className="flex items-center pb-10 pl-2 relative">
        <div
          className="flex items-center justify-center  text-center h-[70px] rounded-tr-3xl rounded-bl-3xl z-30 absolute bottom-5"
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
    <div className="flex flex-col flex-1 h-full rounded-3xl overflow-hidden  bg-white  relative">
      <h3 className={productTitleClass}>{group.title}</h3>
      <div className="flex-1 flex items-center justify-center  min-h-[100px] h-full p-2 ">
        <ImageBlock src={group.image} alt={group.title ?? group.products[0]?.description ?? 'Imagem do produto'} />

        {/* Absolutely positioned codes and specs */}
      </div>

      <div className="grid grid-cols-2 gap-2 grid-rows-1 w-full pl-1 pb-4 z-10 ">
        <PriceDisplay
          price={group.products[0].price}
          priceColor={priceColor}
          priceBackgroundColor={priceBackgroundColor}
        />

        <div className=" items-end z-10">
          {group.products.slice(0, 6).map((p, i) => (
            <div key={p.id} className={i % 2 !== 0 ? 'bg-[#00569F]' : 'bg-[#002F68]'}>
              <div className=" pl-2 pr-2  h-[24px] ">
                <span className="text-white text-[13px] font-bold whitespace-nowrap text-center">
                  {p.code} - <span className="text-[#f3f0f0] font-light">{p.specifications}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDifferentPriceGroup = () => {
    const count = group.products.length;
    let priceFont = 'text-[13px]';
    let rowHeight = 'h-[24px]';

    if (count >= 6) {
      priceFont = 'text-[11px]';
      rowHeight = 'h-[20px]';
    } else if (count === 5) {
      priceFont = 'text-[12px]';
      rowHeight = 'h-[22px]';
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
                <span className="text-white text-[12px] font-bold text-left whitespace-nowrap">{p.code}</span>
                <span className="text-[#f5f3f3] text-[12px] font-light text-center w-full">{p.specifications}</span>
              </div>
              <div
                className={`flex items-center justify-center ${
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
