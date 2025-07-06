import React from 'react';
import { FlyerConfig } from '../types';
import { Type, Image as ImageIcon, Palette } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

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
    <div className="space-y-4">
      {/* Basic Information Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Type className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold">Informações Básicas</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="title">Título do Encarte</Label>
            <Input
              id="title"
              type="text"
              value={config.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ex: Promoções de Janeiro"
            />
          </div>

          <div>
            <Label htmlFor="headerText">Texto do Cabeçalho</Label>
            <Textarea
              id="headerText"
              value={config.headerText}
              onChange={(e) => handleChange('headerText', e.target.value)}
              placeholder="Ex: Ofertas válidas até 31/01/2025"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="footerText">Texto do Rodapé</Label>
            <Textarea
              id="footerText"
              value={config.footerText}
              onChange={(e) => handleChange('footerText', e.target.value)}
              placeholder="Ex: Consulte condições especiais"
              rows={2}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Images Section - Second Row */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <ImageIcon className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold">Imagens</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Label>Imagem do Cabeçalho</Label>
            <ImageUploader
              label="Imagem do Cabeçalho"
              currentImage={config.headerImageUrl}
              onImageChange={(url) => handleImageChange('headerImageUrl', url)}
              targetDimensions={{ width: 1240, height: 474 }}
            />
          </div>

          <div>
            <Label>Imagem do Rodapé</Label>
            <ImageUploader
              label="Imagem do Rodapé"
              currentImage={config.footerImageUrl}
              onImageChange={(url) => handleImageChange('footerImageUrl', url)}
              targetDimensions={{ width: 1240, height: 204 }}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Colors Section - Third Row */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-primary" />
          <h3 className="text-base font-semibold">Cores</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="primaryColor">Cor Primária</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="primaryColor"
                type="color"
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={config.primaryColor}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                placeholder="#d91e2b"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="secondaryColor">Cor Secundária</Label>
            <div className="flex space-x-2 mt-1">
              <Input
                id="secondaryColor"
                type="color"
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={config.secondaryColor}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                placeholder="#2b3990"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};