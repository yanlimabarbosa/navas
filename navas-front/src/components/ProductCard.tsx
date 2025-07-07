import React from "react";
import { ProductGroup, Product } from "../types";

const productTitleClass =
  "text-[13px] font-bold text-[#6d6e71] text-center leading-tight uppercase tracking-tight truncate w-full";

const PriceDisplay = ({ price }: { price: number }) => {
  const formattedPrice = (price ?? 0).toFixed(2).replace(".", ",");
  const fullPriceText = `R$ ${formattedPrice}`;

  return (
    <span
      className="text-xl font-black text-red-600"
      style={{
        fontSize: "20px",
        fontWeight: "900",
        color: "#e7010f",
        letterSpacing: "-0.025em",
        display: "inline-block",
        whiteSpace: "nowrap",
        minWidth: "95px",
        textAlign: "center",
      }}
      data-price={fullPriceText}
    >
      {fullPriceText}
    </span>
  );
};

const ImageBlock = ({ src, alt }: { src?: string; alt: string }) =>
  src ? (
    <img
      src={src.startsWith("/") ? src.slice(1) : src}
      alt={alt}
      className="max-h-full max-w-full object-contain"
    />
  ) : (
    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
      <span className="text-xs text-gray-400">Sem Imagem</span>
    </div>
  );

const ProductSpecsRow = ({ product }: { product: Product }) => {
  const formattedPrice = (product.price ?? 0).toFixed(2).replace(".", ",");
  const fullPriceText = `R$ ${formattedPrice}`;

  return (
    <div className="flex w-full h-[24px] items-center overflow-hidden rounded-md bg-black">
      <div className="flex items-center bg-black pl-2 pr-2 h-[24px] flex-1 min-w-0">
        <span className="text-white text-[13px] font-bold mr-2 min-w-[44px] text-left">
          {product.code}
        </span>
        <span className="text-[#bdbdbd] text-[13px] font-semibold truncate text-center w-full">
          {product.specifications}
        </span>
      </div>
      <div
        className="flex items-center justify-center bg-yellow-400 px-2 h-[24px] rounded-[6px]"
        style={{
          minWidth: "75px",
        }}
      >
        <span
          className="text-sm font-black text-red-600"
          style={{
            fontSize: "13px",
            fontWeight: "900",
            color: "#e7010f",
            letterSpacing: "-0.025em",
            display: "inline-block",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
          data-price={fullPriceText}
        >
          {fullPriceText}
        </span>
      </div>
    </div>
  );
};

interface ProductCardProps {
  group: ProductGroup;
}

export const ProductCard: React.FC<ProductCardProps> = ({ group }) => {
  const renderSingleProduct = (product: Product) => (
    <div className="flex flex-col flex-1 h-full">
      {/* Image takes available space */}
      <div className="relative flex-1 flex items-center justify-center min-h-[100px] max-h-[250px] p-2">
        <ImageBlock
          src={group.image}
          alt={group.title ?? product.description ?? "Imagem do produto"}
        />
        <div className="absolute bottom-2 right-2 bg-black text-white text-[13px] px-2 rounded-md font-bold shadow h-[24px] flex items-center">
          {product.code}
        </div>
      </div>

      {/* Title and price container pushed to bottom with mt-auto */}
      <div className="flex flex-col items-center px-2 mt-auto">
        <h3 className={`${productTitleClass} mb-1`}>{product.description}</h3>
        <div
          className="flex items-center justify-center bg-yellow-400 text-center h-[35px] px-4 rounded-t-[16px]"
          style={{
            minHeight: "35px",
            minWidth: "210px",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <PriceDisplay price={product.price} />
        </div>
      </div>
    </div>
  );

  const renderSamePriceGroup = () => (
    <div className="flex flex-col flex-1 h-full">
      {/* Image takes available space */}
      <div className="relative flex-1 flex items-center justify-center min-h-[100px] max-h-[250px] p-2">
        <ImageBlock
          src={group.image}
          alt={
            group.title ?? group.products[0]?.description ?? "Imagem do produto"
          }
        />
      </div>

      {/* Specs list above title */}
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

      <div className="flex flex-col items-center px-2 mt-auto mb-2">
        <h3 className={`${productTitleClass} mb-1`}>{group.title}</h3>
        <div
          className="flex items-center justify-center bg-yellow-400 text-center h-[35px] px-4 rounded-t-[16px]"
          style={{
            minHeight: "35px",
            minWidth: "210px",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <PriceDisplay price={group.products[0].price} />
        </div>
      </div>
    </div>
  );

  const renderDifferentPriceGroup = () => (
    <div className="flex flex-col justify-between flex-1">
      <div className="relative flex-1 flex items-center justify-center min-h-[100px] max-h-[250px] p-2">
        <ImageBlock
          src={group.image}
          alt={
            group.title ?? group.products[0]?.description ?? "Imagem do produto"
          }
        />
      </div>

      <div className="w-full flex items-center justify-center mt-auto mb-2">
        <h3 className={productTitleClass}>{group.title}</h3>
      </div>

      <div className="flex flex-col gap-2 w-full px-2 pb-2">
        {group.products.slice(0, 3).map((p) => (
          <ProductSpecsRow key={p.id} product={p} />
        ))}
      </div>
    </div>
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
