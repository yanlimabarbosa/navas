import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';

import { Input } from './ui/input';
import { Label } from './ui/label';
import { FolderOpen } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { ImageProcessor } from '../utils/imageProcessor';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [imagesPath, setImagesPath] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    if (open && isElectron) {
      loadSettings();
    }
  }, [isElectron, open]);

  const loadSettings = async () => {
    if (!window.electronAPI) return;

    try {
      setLoading(true);
      const settings = await window.electronAPI.getSettings();
      if (settings.imagesPath) {
        setImagesPath(settings.imagesPath);
      } else {
        // Fallback to current path if not set in settings
        const currentPath = await window.electronAPI.getImagensPath();
        setImagesPath(currentPath);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDirectory = async () => {
    if (!window.electronAPI) return;

    try {
      const path = await window.electronAPI.selectImagesDirectory();
      if (path) {
        setImagesPath(path);
      }
    } catch (error) {
      console.error('Failed to select directory:', error);
    }
  };

  const handleSave = async () => {
    if (!window.electronAPI) return;

    try {
      const success = await window.electronAPI.saveSettings({ imagesPath });
      if (success) {
        // Force reload of images path in app
        await ImageProcessor.initializeImagesPrefix();

        toast({
          title: 'Sucesso',
          description: 'Configurações salvas com sucesso!',
          variant: 'success',
        });
        onOpenChange(false);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Configurações do Aplicativo</DialogTitle>
          <DialogDescription>Configure os diretórios padrão e preferências do sistema.</DialogDescription>
        </DialogHeader>

        {!isElectron && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 text-sm" role="alert">
            <p className="font-bold">Modo Navegador</p>
            <p>As configurações de diretório só estão disponíveis no aplicativo Desktop.</p>
          </div>
        )}

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="images-path">Pasta de Imagens dos Produtos</Label>
            <div className="flex space-x-2">
              <Input
                id="images-path"
                value={imagesPath}
                readOnly
                placeholder="Selecione a pasta de imagens..."
                className="flex-1"
                disabled={!isElectron}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSelectDirectory}
                title="Selecionar Pasta"
                disabled={!isElectron}
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Local onde o sistema buscará as imagens dos produtos automaticamente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !isElectron}>
            {loading ? 'Carregando...' : 'Salvar Alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
