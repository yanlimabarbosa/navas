import React from "react";
import { ProductGroup, Product } from "../types";

const formatPrice = (price: number) => price.toFixed(2).replace(".", ",");

const productTitleClass =
  "text-[13px] font-bold text-[#6d6e71] text-center leading-tight uppercase tracking-tight truncate w-full";

const PriceDisplay = ({ price }: { price: number }) => (
  <span className="text-[20px] font-extrabold text-[#e7010f] tracking-tighter">
    R$ {formatPrice(price)}
  </span>
);

const ImageBlock = ({ src, alt }: { src?: string; alt: string }) =>
  src ? (
    <img
      src={src.startsWith("/") ? src.slice(1) : src}
      alt={alt}
      className="h-full w-full object-contain"
    />
  ) : (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <span className="text-xs text-gray-400">Sem Imagem</span>
    </div>
  );

const ProductSpecsRow = ({ product }: { product: Product }) => (
  <div className="flex w-full h-[24px] items-center overflow-hidden">
    <div className="flex items-center bg-black pl-2 pr-2 h-[18px] flex-1 min-w-0 rounded-l-lg my-auto">
      <span className="text-white text-[13px] font-bold mr-2 min-w-[44px] text-left">
        {product.code}
      </span>
      <span className="text-[#bdbdbd] text-[13px] font-semibold truncate text-center w-full">
        {product.specifications}
      </span>
    </div>
    <div className="flex items-center justify-center bg-yellow-400 px-2 h-[18px] min-w-[72px] rounded-md my-auto -ml-2 z-10">
      <span className="text-[13px] font-extrabold text-[#e7010f] tracking-tighter leading-none">
        R$ {formatPrice(product.price)}
      </span>
    </div>
  </div>
);

interface ProductCardProps {
  group: ProductGroup;
  isPreview?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  group,
  isPreview = false,
}) => {
  const renderSingleProduct = (product: Product) => (
    <>
      <div className="flex-1 flex flex-col justify-start">
        <div className="relative w-full flex-shrink-0 flex-1 flex items-center justify-center">
          <ImageBlock
            src={group.image}
            alt={group.title || product.description || "Imagem do produto"}
          />
          <div className="absolute bottom-2 right-2 bg-black text-white text-[11px] px-2 py-0.5 rounded-md font-semibold shadow">
            Cód. {product.code}
          </div>
        </div>
        <div
          className="w-full flex items-center justify-center px-2"
          style={{ minHeight: "28px" }}
        >
          <h3 className={productTitleClass}>{product.description}</h3>
        </div>
      </div>
      <div className="w-full">
        <div className="w-full flex items-center justify-center bg-yellow-400 text-center h-[38px] rounded-b-md">
          <PriceDisplay price={product.price} />
        </div>
      </div>
    </>
  );

  const renderSamePriceGroup = () => (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="relative w-full flex-shrink-0 flex-1 flex items-center justify-center min-h-[90px]">
          <ImageBlock
            src={group.image}
            alt={
              group.title ||
              group.products[0]?.description ||
              "Imagem do produto"
            }
          />
        </div>
        <div className="flex flex-col items-end w-full px-2 pb-2">
          {group.products.map((p) => (
  <div key={p.id} className="mb-1 last:mb-0 w-full flex justify-end">
    <div className="flex items-center bg-black pl-2 pr-2 rounded-md h-[24px] w-[110px] ml-auto justify-center">
      <span className="text-white text-[13px] font-bold truncate text-center">
        {p.code} - {p.specifications}
      </span>
    </div>
  </div>
))}

        </div>

        <div className="w-full flex items-center justify-center px-2 mt-1 mb-1">
          <h3 className={productTitleClass}>{group.title}</h3>
        </div>
      </div>
      <div className="w-full">
        <div className="w-full flex items-center justify-center bg-yellow-400 text-center h-[38px] rounded-b-md">
          <PriceDisplay price={group.products[0].price} />
        </div>
      </div>
    </>
  );

  const renderDifferentPriceGroup = () => (
    <>
      <div className="relative w-full flex-shrink-0 flex-1 flex items-center justify-center min-h-[90px] max-h-[150px]">
        <ImageBlock
          src={group.image}
          alt={
            group.title || group.products[0]?.description || "Imagem do produto"
          }
        />
      </div>
      <div className="w-full flex items-center justify-center mt-1 mb-5">
        <h3 className={productTitleClass}>{group.title}</h3>
      </div>
      <div className="flex flex-col gap-[1px] w-full px-2 pb-2">
        {group.products.slice(0, 3).map((p) => (
          <ProductSpecsRow key={p.id} product={p} />
        ))}
      </div>
    </>
  );

  const renderContent = () => {
    if (!group) return null;

    switch (group.groupType) {
      case "single":
        return renderSingleProduct(group.products[0]);
      case "same-price":
        return renderSamePriceGroup();
      case "different-price":
        return renderDifferentPriceGroup();
      default:
        return (
          <div className="text-xs text-red-500">Tipo de grupo inválido</div>
        );
    }
  };

  const baseClasses =
    "w-full h-full flex flex-col overflow-hidden p-0 relative " +
    (["single", "same-price", "different-price"].includes(group.groupType)
      ? "bg-white border border-black shadow-none rounded-[8px] " +
        'before:content-[" "] before:block before:w-full before:h-[4px] before:absolute before:top-0 before:left-0'
      : "bg-white border-2 border-gray-100 shadow-sm rounded-lg p-2");

  return <div className={baseClasses}>{renderContent()}</div>;
};
