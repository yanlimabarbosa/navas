import React, { forwardRef } from 'react';
import { ProductCard } from './ProductCard';
import { ProductGroup, FlyerConfig } from '../types';

interface FlyerPreviewProps {
  groups: ProductGroup[];
  config: FlyerConfig;
  className?: string;
}

export const FlyerPreview = forwardRef<HTMLDivElement, FlyerPreviewProps>(({ groups, config, className = '' }, ref) => {
  const groupsByPosition = new Map(groups.map((group) => [group.position, group]));
  const gridSlots = Array.from({ length: 12 }, (_, index) => index + 1);

  const bgString = !config.headerImageUrl
    ? `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor})`
    : `url(${config.headerImageUrl}) center/cover`;
  console.log('🚀 ~ config.headerImageUrl:', config.headerImageUrl);

  return (
    <div
      ref={ref}
      className={`bg-white shadow-xl rounded-none overflow-hidden flex flex-col ${className}`}
      style={{
        width: '1240px',
        height: `${474 + 1070 + 204}px`, // 1748px
        maxWidth: '1240px',
        maxHeight: `${474 + 1070 + 204}px`,
        boxSizing: 'border-box',
        background: '#fff',
        fontFamily: "'Inter', Arial, sans-serif",
        fontSize: '16px',
      }}
    >
      <main
        style={{
          background: config.headerImageUrl
            ? `url(${config.headerImageUrl})`
            : `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor})`,
        }}
      >
        <header className="relative text-white text-center min-h-[474px] h-[474px] w-[1240px]"></header>

        <main
          className="flex flex-col"
          style={{ width: '1240px', height: '1070px', padding: '0px', boxSizing: 'border-box' }}
        >
          <div
            className="grid grid-cols-4 grid-rows-3 gap-0 border-black"
            style={{
              width: '100%',
              height: '100%',
              borderTop: '1px solid black',
              borderLeft: '1px solid black',
            }}
          >
            {gridSlots.map((position) => {
              const groupForPosition = groupsByPosition.get(position);
              return (
                <div
                  key={position}
                  className="h-full"
                  style={{
                    borderRight: '1px solid black',
                    borderBottom: '1px solid black',
                  }}
                >
                  {groupForPosition ? (
                    <ProductCard group={groupForPosition} />
                  ) : (
                    <div className="bg-white h-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </main>

      <footer
        className="relative text-white"
        style={{
          width: '1240px',
          height: '204px',
          flexShrink: 0,
          background: config.footerImageUrl
            ? `url(${config.footerImageUrl}) center/cover`
            : `linear-gradient(to right, ${config.secondaryColor}, #1e3a8a)`,
        }}
      >
        {!config.footerImageUrl && (
          <div className="p-3 h-full flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                <div className="text-blue-800 font-bold text-xs">NAVAS</div>
              </div>
              <div>
                <h3 className="text-lg font-bold">NAVAS</h3>
                <p className="text-xs opacity-90">DISTRIBUIÇÃO</p>
              </div>
            </div>
            {config.footerText && (
              <div className="text-right">
                <p className="text-xs font-medium">{config.footerText}</p>
              </div>
            )}
          </div>
        )}
        {config.footerImageUrl && config.footerText && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
            <p className="text-xs font-medium text-center">{config.footerText}</p>
          </div>
        )}
      </footer>
    </div>
  );
});

FlyerPreview.displayName = 'FlyerPreview';
