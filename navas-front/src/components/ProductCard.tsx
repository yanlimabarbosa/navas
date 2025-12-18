import React, { useEffect, useRef, useState } from 'react';
import { ProductGroup, FlyerConfig } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

// Helper function to darken a hex color
const darkenColor = (hex: string, percent: number): string => {
  // Remove # if present
  const color = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Darken each channel
  const newR = Math.max(0, Math.floor(r * (1 - percent)));
  const newG = Math.max(0, Math.floor(g * (1 - percent)));
  const newB = Math.max(0, Math.floor(b * (1 - percent)));

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB
    .toString(16)
    .padStart(2, '0')}`;
};

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
  const [inteiro, decimal] = price.toFixed(2).replace('.', ',').split(',');

  return (
    <div
      className=" font-anton flex gap-1 p-2 items-center text-xl font-black whitespace-nowrap leading-none min-w-[90px] h-full rounded-tr-3xl rounded-bl-3xl "
      style={{
        color: priceColor,
        backgroundColor: priceBackgroundColor,
        textAlign: align,
        fontFamily: 'Anton, sans-serif',
      }}
      data-print-element="product-card-price"
    >
      <div className="text-[22px] mb-4 leading-none ">R$ </div>
      <div className="text-[42px] leading-none">{inteiro}</div>
      <div className="text-[22px] leading-none">,{decimal}</div>
    </div>
  );
};

const ImageBlock = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="w-full aspect-square rounded-md p-1 flex items-center justify-center max-w-[195px] mx-auto">
    {src ? (
      <img src={ImageProcessor.getImagePath(src)} alt={alt} className="w-full h-full object-contain" />
    ) : (
      <span className="text-[10px] text-gray-400">Sem Imagem</span>
    )}
  </div>
);

export const ProductCard: React.FC<{ group: ProductGroup; config: FlyerConfig }> = ({ group, config }) => {
  const isSingle = group.groupType === 'single';
  const isSamePrice = group.groupType === 'same-price';

  const [stackSamePrice, setStackSamePrice] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSamePrice) return;

    const measure = () => {
      if (!gridRef.current || !priceRef.current) return;
      setStackSamePrice(priceRef.current.scrollWidth > gridRef.current.clientWidth / 2 - 8);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isSamePrice]);

  // SINGLE
  if (isSingle) {
    const product = group.products[0];

    return (
      <CardContainer
        title={(product.description || '').trim()}
        subtitleBackgroundColor={config.subtitleBackgroundColor}
      >
        <div
          className="text-white text-[13px] text-center font-bold"
          style={{ backgroundColor: config.subtitleBackgroundColor }}
        >
          {product.code.trim()}
        </div>

        <ProductImageSection src={group.image} alt={(product.description || '').trim()} />

        <div className="absolute bottom-5 left-2">
          <PriceDisplay
            price={product.price}
            priceColor={config.priceColor}
            priceBackgroundColor={config.priceBackgroundColor}
          />
        </div>
      </CardContainer>
    );
  }

  if (isSamePrice) {
    return (
      <CardContainer title={group.title.trim()} subtitleBackgroundColor={config.subtitleBackgroundColor}>
        <ProductImageSection src={group.image} alt={group.title.trim()} />

        <div
          ref={gridRef}
          className={`absolute bottom-0 w-full pl-1 pb-4 grid gap-2 ${
            stackSamePrice ? 'grid-cols-1 justify-items-end' : 'grid-cols-2'
          }`}
        >
          <div ref={priceRef} className="flex justify-end">
            <PriceDisplay
              price={group.products[0].price}
              priceColor={config.priceColor}
              priceBackgroundColor={config.priceBackgroundColor}
              align={stackSamePrice ? 'right' : 'center'}
            />
          </div>

          <div className={stackSamePrice ? 'flex flex-col items-end text-right' : ''}>
            <ProductList
              products={group.products}
              showPrice={false}
              subtitleBackgroundColor={config.subtitleBackgroundColor}
            />
          </div>
        </div>
      </CardContainer>
    );
  }

  const count = group.products.length;
  const priceFont = count >= 6 ? 'text-[11px]' : count === 5 ? 'text-[12px]' : 'text-[13px]';

  return (
    <CardContainer title={group.title.trim()} subtitleBackgroundColor={config.subtitleBackgroundColor}>
      <ProductImageSection src={group.image} alt={group.title.trim()} />

      <div className="px-2 pb-2 bg">
        <ProductList
          products={group.products}
          showPrice
          priceFont={priceFont}
          subtitleBackgroundColor={config.subtitleBackgroundColor}
          priceBackgroundColor={config.priceBackgroundColor}
          priceColor={config.priceColor}
        />
      </div>
    </CardContainer>
  );
};

const CardContainer: React.FC<{ title: string; subtitleBackgroundColor?: string; children: React.ReactNode }> = ({
  title,
  subtitleBackgroundColor,
  children,
}) => {
  const baseColor = subtitleBackgroundColor || '#00579F';
  const darkerColor = darkenColor(baseColor, 0.15);
  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-white relative">
      <h3
        className={`text-[13px] font-bold text-[#f0f0f0] text-center leading-tight uppercase tracking-tight break-words w-full py-3 px-3`}
        style={{
          backgroundColor: darkerColor,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
};

const ProductImageSection = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="flex-1 flex items-center justify-center min-h-[100px] p-2">
    <ImageBlock src={src} alt={alt} />
  </div>
);
const ProductList = ({
  products,
  showPrice,
  priceFont = 'text-[13px]',
  subtitleBackgroundColor,
  priceBackgroundColor,
  priceColor,
}: {
  products: ProductGroup['products'];
  showPrice: boolean;
  priceFont?: string;
  subtitleBackgroundColor?: string;
  priceBackgroundColor?: string;
  priceColor?: string;
}) => {
  // Calcula cores baseadas no subtitleBackgroundColor
  const baseColor = subtitleBackgroundColor || '#00579F';
  const darkerColor = darkenColor(baseColor, 0.3);
  const darkerBackgroundColor = darkenColor(priceBackgroundColor || '', 0.3);
  return (
    <>
      {products.slice(0, 6).map((p, i) => (
        <div
          key={p.id}
          className="flex min-h-[24px] items-center overflow-hidden py-0"
          style={{
            backgroundColor: i % 2 !== 0 ? darkerColor : baseColor,
          }}
        >
          <div className="flex items-center px-2 flex-1">
            <span className="text-white text-[12px] font-bold whitespace-nowrap">{p.code.trim()}</span>
            <span className="text-[#f5f3f3] text-[12px] font-light text-center w-full">
              {(p.specifications || '').trim()}
            </span>
          </div>

          {showPrice && (
            <div
              data-print-element="product-card-multiple-price"
              className={`font-anton text-[12px] ${priceFont} px-2 min-w-[96px] flex items-center justify-center self-stretch`}
              style={{
                backgroundColor: i % 2 === 0 ? darkerBackgroundColor : priceBackgroundColor,
                color: priceColor,
              }}
            >
              R$ {p.price.toFixed(2).replace('.', ',')}
            </div>
          )}
        </div>
      ))}
    </>
  );
};
