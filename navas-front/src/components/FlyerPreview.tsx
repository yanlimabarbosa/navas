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

    return (
      <div
        ref={ref}
        className={`bg-white shadow-xl rounded-lg overflow-hidden flex flex-col ${className}`}
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
        {/* Header */}
        <div
          className="relative text-white text-center"
          style={{
            width: '1240px',
            height: '474px',
            flexShrink: 0,
            background: !config.headerImageUrl ? `linear-gradient(to right, ${config.primaryColor}, ${config.secondaryColor})` : undefined
          }}
        >
          {config.headerImageUrl ? (
            <img
              src={config.headerImageUrl}
              alt="Header"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', margin: 0, padding: 0, border: 0, background: '#fff' }}
            />
          ) : (
            <div className="relative z-10 h-full flex flex-col justify-center items-center" style={{padding: 0, margin: 0}}>
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              {config.title && (
                <h2
                  className="text-4xl font-black bg-white text-red-600 px-4 py-2 rounded inline-block max-w-full tracking-normal"
                  style={{ letterSpacing: '0.1px' }}
                >
                  {config.title || 'Encarte sem Título'}
                </h2>
              )}
              {config.headerText && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <p className="text-sm font-medium">{config.headerText}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="flex flex-col" style={{ width: '1240px', height: '1070px', padding: '16px', boxSizing: 'border-box' }}>
          <div className="grid grid-cols-4 grid-rows-3 gap-2" style={{ width: '100%', height: '100%' }}>
            {gridSlots.map((position) => {
              const groupForPosition = groupsByPosition.get(position);
              return (
                <div key={position} className="h-full">
                  {groupForPosition ? (
                    <ProductCard group={groupForPosition} />
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
            width: '1240px',
            height: '204px',
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