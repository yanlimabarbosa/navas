import React from "react";
import { ProductGroup, Product } from "../types";

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

export const ProductCard: React.FC<ProductCardProps> = ({
  group,
  isPreview = false,
}) => {
  const imageHeight = "h-[110px]";

  const PriceTag = ({ children }: { children: React.ReactNode }) => (
    <div
      className="flex items-center justify-center bg-yellow-400 text-black text-center rounded-md mt-2"
      style={{
        height: "40px",
        minHeight: "40px",
        maxHeight: "40px",
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );

  const ImageSection = () => (
    <div className={`w-full ${imageHeight} flex items-center justify-center`}>
      {group.image ? (
        <img
          src={group.image.startsWith("/") ? group.image.slice(1) : group.image}
          alt={
            group.title || group.products[0]?.description || "Imagem do produto"
          }
          className="h-full w-full object-contain"
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
    const title =
      group.groupType === "single"
        ? group.products[0]?.description
        : group.title;
    return (
      <h3 className="text-xs font-semibold text-gray-800 text-center leading-tight mb-2">
        {title}
      </h3>
    );
  };

  const renderSingleProduct = (product: Product) => (
    <>
      <div className="flex-1 flex flex-col justify-start">
        <div className="relative w-full flex-shrink-0 flex-1 flex items-center justify-center">
          {group.image ? (
            <img
              src={
                group.image.startsWith("/") ? group.image.slice(1) : group.image
              }
              alt={
                group.title ||
                group.products[0]?.description ||
                "Imagem do produto"
              }
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">Sem Imagem</span>
            </div>
          )}
          {/* Product code overlay, bottom right */}
          <div className="absolute bottom-2 right-2 bg-black text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow">
            Cód. {product.code}
          </div>
        </div>
        <div
          className="w-full flex items-center justify-center px-2"
          style={{ minHeight: "28px" }}
        >
          <h3
            className="text-[13px] font-bold text-[#6d6e71] text-center leading-tight uppercase tracking-tight truncate w-full"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {product.description}
          </h3>
        </div>
      </div>
      <div className="w-full">
        <div
          className="w-full flex items-center justify-center bg-yellow-400 text-center"
          style={{
            height: "38px",
            minHeight: "38px",
            maxHeight: "38px",
            borderRadius: "0 0 8px 8px",
            marginBottom: 0,
          }}
        >
          <span
            className="text-[20px] font-extrabold"
            style={{ color: "#e7010f", letterSpacing: "-1px" }}
          >
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </>
  );

  const renderSamePriceGroup = () => (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        <div
          className="relative w-full flex-shrink-0 flex-1 flex items-center justify-center"
          style={{ minHeight: "90px" }}
        >
          {group.image ? (
            <img
              src={
                group.image.startsWith("/") ? group.image.slice(1) : group.image
              }
              alt={
                group.title ||
                group.products[0]?.description ||
                "Imagem do produto"
              }
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">Sem Imagem</span>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end w-full px-2 pb-2">
          {group.products.map((p) => (
            <div
              key={p.id}
              className="flex h-[24px] items-center mb-1 last:mb-0 max-w-full"
            >
              <div className="flex items-center bg-black pl-2 pr-2 rounded-full h-full max-w-fit">
                <span className="text-white text-[13px] font-bold mr-2 min-w-[44px] text-left">
                  {p.code}
                </span>
                <span className="text-[#bdbdbd] text-[13px] font-semibold truncate">
                  {p.specifications}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="w-full flex items-center justify-center px-2 mt-1 mb-1">
          <h3
            className="text-[13px] font-bold text-[#6d6e71] text-center leading-tight uppercase tracking-tight truncate w-full"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {group.title}
          </h3>
        </div>
      </div>
      <div className="w-full">
        <div
          className="w-full flex items-center justify-center bg-yellow-400 text-center"
          style={{
            height: "38px",
            minHeight: "38px",
            maxHeight: "38px",
            borderRadius: "0 0 8px 8px",
            marginBottom: 0,
          }}
        >
          <span
            className="text-[20px] font-extrabold"
            style={{ color: "#e7010f", letterSpacing: "-1px" }}
          >
            R$ {group.products[0].price.toFixed(2).replace(".", ",")}
          </span>
        </div>
      </div>
    </>
  );

  const renderDifferentPriceGroup = () => (
    <>
      <div
        className="relative w-full flex-shrink-0 flex-1 flex items-center justify-center"
        style={{ minHeight: "90px", maxHeight: "150px" }}
      >
        {group.image ? (
          <img
            src={
              group.image.startsWith("/") ? group.image.slice(1) : group.image
            }
            alt={
              group.title ||
              group.products[0]?.description ||
              "Imagem do produto"
            }
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-xs text-gray-400">Sem Imagem</span>
          </div>
        )}
      </div>
      <div className="w-full flex items-center justify-center mt-1 mb-1">
        <h3
          className="text-[13px] font-bold text-[#6d6e71] text-center leading-tight uppercase tracking-tight truncate w-full"
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {group.title}
        </h3>
      </div>
      <div className="flex flex-col gap-1 w-full px-2 pb-2">
        {group.products.slice(0, 3).map((p) => (
          <div
            key={p.id}
            className="flex w-full h-[24px] items-center overflow-hidden"
          >
            {/* Left: code + spec */}
            <div className="flex items-center bg-black pl-2 pr-2 h-full flex-1 min-w-0 rounded-l-lg">
              <span className="text-white text-[13px] font-bold mr-2 min-w-[44px] text-left">
                {p.code}
              </span>
              <span className="text-[#bdbdbd] text-[13px] font-semibold truncate text-center w-full">
                {p.specifications}
              </span>
            </div>

            {/* Right: price */}
            <div className="flex items-center justify-end bg-yellow-400 px-2 h-full w-auto rounded-r-xl">
              <span
                className="text-[13px] font-extrabold text-[#e7010f]"
                style={{ letterSpacing: "-1px" }}
              >
                R$ {p.price.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
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

  return (
    <div
      className={
        ["single", "same-price", "different-price"].includes(group.groupType)
          ? "bg-white border border-black w-full h-full flex flex-col h-full p-0 shadow-none rounded-[8px] relative" +
            ' before:content-[" "] before:block before:w-full before:h-[4px]  before:absolute before:top-0 before:left-0'
          : "bg-white border-2 border-gray-100 w-full h-full flex flex-col p-2 shadow-sm rounded-lg"
      }
      style={{ overflow: "hidden" }}
    >
      {group.groupType === "single" ? (
        <>
          <div className="flex-1 flex flex-col justify-start">
            <div className="relative w-full flex-shrink-0 flex-1 flex items-center justify-center">
              {group.image ? (
                <img
                  src={
                    group.image.startsWith("/")
                      ? group.image.slice(1)
                      : group.image
                  }
                  alt={
                    group.title ||
                    group.products[0]?.description ||
                    "Imagem do produto"
                  }
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Sem Imagem</span>
                </div>
              )}
              {/* Product code overlay, bottom right */}
              <div className="absolute bottom-2 right-2 bg-black text-white text-[11px] px-2 py-0.5 rounded-full font-semibold shadow">
                Cód. {group.products[0].code}
              </div>
            </div>
            <div
              className="w-full flex items-center justify-center px-2"
              style={{ minHeight: "28px" }}
            >
              <h3
                className="text-[13px] font-bold text-[#6d6e71] text-center leading-tight uppercase tracking-tight truncate w-full"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {group.products[0].description}
              </h3>
            </div>
          </div>
          <div className="w-full">
            <div
              className="w-full flex items-center justify-center bg-yellow-400 text-center"
              style={{
                height: "38px",
                minHeight: "38px",
                maxHeight: "38px",
                borderRadius: "0 0 8px 8px",
                marginBottom: 0,
              }}
            >
              <span
                className="text-[20px] font-extrabold"
                style={{ color: "#e7010f", letterSpacing: "-1px" }}
              >
                R$ {group.products[0].price.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </>
      ) : (
        renderContent()
      )}
    </div>
  );
};
