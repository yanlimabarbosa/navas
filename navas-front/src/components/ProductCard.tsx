import React, { useEffect, useRef, useState } from 'react';
import { ProductGroup, FlyerConfig } from '../types';
import { ImageProcessor } from '../utils/imageProcessor';

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
      <CardContainer title={product.description || ''}>
        <div className="bg-[#00579F] text-white text-[13px] text-center font-bold">{product.code}</div>

        <ProductImageSection src={group.image} alt={product.description || ''} />

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
      <CardContainer title={group.title}>
        <ProductImageSection src={group.image} alt={group.title} />

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
            <ProductList products={group.products} showPrice={false} />
          </div>
        </div>
      </CardContainer>
    );
  }

  const count = group.products.length;
  const priceFont = count >= 6 ? 'text-[11px]' : count === 5 ? 'text-[12px]' : 'text-[13px]';
  const rowHeight = count >= 6 ? 'h-[20px]' : count === 5 ? 'h-[22px]' : 'h-[24px]';

  return (
    <CardContainer title={group.title}>
      <ProductImageSection src={group.image} alt={group.title} />

      <div className="px-2 pb-2">
        <ProductList products={group.products} showPrice priceFont={priceFont} rowHeight={rowHeight} />
      </div>
    </CardContainer>
  );
};

const CardContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex flex-col h-full rounded-3xl overflow-hidden bg-white relative">
    <h3 className="text-[13px] font-bold text-[#f0f0f0] text-center leading-tight uppercase tracking-tight break-words w-full bg-[#003169] py-3 px-3">
      {title}
    </h3>
    {children}
  </div>
);

const ProductImageSection = ({ src, alt }: { src?: string; alt: string }) => (
  <div className="flex-1 flex items-center justify-center min-h-[100px] p-2">
    <ImageBlock src={src} alt={alt} />
  </div>
);
const ProductList = ({
  products,
  showPrice,
  priceFont = 'text-[13px]',
  rowHeight = 'h-[24px]',
}: {
  products: ProductGroup['products'];
  showPrice: boolean;
  priceFont?: string;
  rowHeight?: string;
}) => (
  <>
    {products.slice(0, 6).map((p, i) => (
      <div
        key={p.id}
        className={`flex min-${rowHeight} items-center overflow-hidden py-0 ${i % 2 ? 'bg-[#00569F]' : 'bg-[#002F68]'}`}
      >
        <div className="flex items-center px-2 flex-1">
          <span className="text-white text-[12px] font-bold whitespace-nowrap">{p.code}</span>
          <span className="text-[#f5f3f3] text-[12px] font-light text-center w-full">{p.specifications}</span>
        </div>

        {showPrice && (
          <div
            data-print-element="product-card-multiple-price"
            className={`font-anton text-[12px] text-[#002F68] ${priceFont} ${
              i % 2 === 0 ? 'bg-yellow-400' : 'bg-yellow-500'
            } px-2 min-w-[96px] h-[100%] flex items-center justify-center`}
          >
            R$ {p.price.toFixed(2).replace('.', ',')}
          </div>
        )}
      </div>
    ))}
  </>
);
