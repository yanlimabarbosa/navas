import React, { forwardRef } from 'react';
import { ProductCard } from './ProductCard';
import { ProductGroup, FlyerConfig } from '../types';

interface FlyerPreviewProps {
  groups: ProductGroup[];
  config: FlyerConfig;
  className?: string;
}

export const FlyerPreview = forwardRef<HTMLDivElement, FlyerPreviewProps>(
  ({ groups, config, className = '' }, ref) => {
    const groupsByPosition = new Map(groups.map(group => [group.position, group]));
    const gridSlots = Array.from({ length: 12 }, (_, index) => index + 1);
    const isExportMode = className.includes('export-mode');

    return (
      <div
        ref={ref}
        className={`bg-white shadow-xl rounded-lg overflow-hidden flex flex-col ${className}`}
        style={{
          width: isExportMode ? '794px' : '100%',
          height: isExportMode ? '1123px' : 'auto',
          maxWidth: isExportMode ? '794px' : '100%',
          maxHeight: isExportMode ? '1123px' : 'none',
          boxSizing: 'border-box',
          background: '#fff',
          fontFamily: "'Inter', Arial, sans-serif",
          fontSize: '16px',
        }}
      >
        {/* Header */}
        <div
          className="relative text-white text-center"
          style={{
            height: '150px',
            flexShrink: 0,
            background: config.headerImageUrl
              ? `url(${config.headerImageUrl}) center/cover`
              : `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor})`
          }}
        >
          {!config.headerImageUrl && (
            <>
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              <div className="relative z-10 p-6 h-full flex flex-col justify-center items-center">
                <h2
                  className="text-4xl font-black bg-white text-red-600 px-4 py-2 rounded inline-block max-w-full tracking-normal"
                  style={{ letterSpacing: '0.1px' }}
                >
                  {config.title || 'Encarte sem Título'}
                </h2>
                {config.headerText && (
                  <p
                    className="text-lg mt-3 font-medium tracking-normal"
                    style={{ letterSpacing: '0.1px' }}
                  >
                    {config.headerText}
                  </p>
                )}
              </div>
            </>
          )}
          {config.headerImageUrl && config.headerText && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
              <p className="text-sm font-medium">{config.headerText}</p>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className={`p-4 flex-1 flex flex-col${isExportMode ? '' : ''}`} style={isExportMode ? { minHeight: 0 } : {}}>
          <div className="grid grid-cols-4 grid-rows-3 gap-2 h-full" style={{ height: '100%' }}>
            {gridSlots.map((position) => {
              const groupForPosition = groupsByPosition.get(position);
              return (
                <div key={position} className="h-full">
                  {groupForPosition ? (
                    <ProductCard group={groupForPosition} isPreview={true} />
                  ) : (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Posição {position}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative text-white"
          style={{
            height: '65px',
            flexShrink: 0,
            background: config.footerImageUrl
              ? `url(${config.footerImageUrl}) center/cover`
              : `linear-gradient(to right, ${config.secondaryColor}, #1e3a8a)`
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
        </div>
      </div>
    );
  }
);

FlyerPreview.displayName = 'FlyerPreview';