import React from 'react';
import { Settings, Palette, Type, Image as ImageIcon } from 'lucide-react';
import { FlyerConfig, HEADER_DIMENSIONS, FOOTER_DIMENSIONS } from '../types';
import { ImageUploader } from './ImageUploader';

interface ConfigPanelProps {
  config: FlyerConfig;
  onConfigChange: (config: FlyerConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onConfigChange }) => {
  const handleChange = (field: keyof FlyerConfig, value: string) => {
    onConfigChange({
      ...config,
      [field]: value,
      updatedAt: new Date()
    });
  };

  const handleImageChange = (field: 'headerImageUrl' | 'footerImageUrl', imageUrl: string | undefined) => {
    onConfigChange({
      ...config,
      [field]: imageUrl,
      updatedAt: new Date()
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Configurações do Encarte</h2>
      </div>

      <div className="space-y-6">
        {/* Basic Configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Type className="w-4 h-4" />
              <span>Título do Encarte</span>
            </label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Promoções de Janeiro"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Cabeçalho
            </label>
            <textarea
              value={config.headerText}
              onChange={(e) => handleChange('headerText', e.target.value)}
              placeholder="Ex: Ofertas válidas até 31/01/2025"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Rodapé
            </label>
            <textarea
              value={config.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
              placeholder="Ex: Consulte condições especiais"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Imagens Personalizadas</h3>
          </div>
          
          <div className="space-y-4">
            <ImageUploader
              label="Imagem do Cabeçalho"
              currentImageUrl={config.headerImageUrl}
              expectedDimensions={HEADER_DIMENSIONS}
              onImageChange={(imageUrl) => handleImageChange('headerImageUrl', imageUrl)}
            />

            <ImageUploader
              label="Imagem do Rodapé"
              currentImageUrl={config.footerImageUrl}
              expectedDimensions={FOOTER_DIMENSIONS}
              onImageChange={(imageUrl) => handleImageChange('footerImageUrl', imageUrl)}
            />
          </div>
        </div>

        {/* Color Configuration */}
        <div className="border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Cores</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária
              </label>
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária
              </label>
              <input
                type="color"
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cor de Fundo
            </label>
            <input
              type="color"
              value={config.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};