import React, { useState, useRef, useCallback } from 'react';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { Download, FileSpreadsheet, Upload, Settings, Eye, ArrowLeft } from 'lucide-react';
import { processExcelFile } from './utils/excelProcessor';
import { FlyerPreview } from './components/FlyerPreview';
import { MultiFlyerPreview } from './components/MultiFlyerPreview';
import { ConfigPanel } from './components/ConfigPanel';
import { TemplateDownloadPanel } from './components/TemplateDownloadPanel';
import { FlyerConfig, ProductGroup, Product } from './types';
import { exportElementAsImage, exportElementAsPDF } from './utils/htmlExporterV2';
import { ImageProcessor } from './utils/imageProcessor';

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  );
}

function App() {
  const { toast } = useToast();
  const [view, setView] = useState<{
    state: 'upload' | 'preview';
    config?: FlyerConfig;
    groups?: ProductGroup[];
    products?: Product[];
  }>({ state: 'upload' });

  const [isExporting, setIsExporting] = useState<{ pdf: boolean; jpg: boolean; html: boolean }>({
    pdf: false,
    jpg: false,
    html: false,
  });
  const [dragActive, setDragActive] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  // Initialize images path
  React.useEffect(() => {
    const initializeImages = async () => {
      try {
        await ImageProcessor.initializeImagesPrefix();
      } catch (error) {
        console.error('Falha ao inicializar imagens:', error);
      }
    };

    initializeImages();
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      try {
        const groups = await processExcelFile(file);
        const products = groups.flatMap((group) => group.products);

        setView({
          state: 'preview',
          config: {
            id: 'config-1',
            title: 'Encarte de Ofertas',
            backgroundColor: '#FFFFFF',
            primaryColor: '#d91e2b',
            secondaryColor: '#2b3990',
            priceColor: '#ffffff',
            priceBackgroundColor: '#00569F',
            subtitleBackgroundColor: '#00579F',
            createdAt: new Date(),
            updatedAt: new Date(),
            headerImageUrl: '',
            footerImageUrl: '',
          },
          groups,
          products,
        });
      } catch (error: unknown) {
        console.error('Erro ao processar arquivo:', error);
        let message = 'Erro ao processar arquivo. Verifique se o formato está correto.';
        if (isErrorWithMessage(error)) {
          message = error.message;
        }
        toast({
          title: 'Erro',
          description: message,
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        await processFile(file);
      }
    },
    [processFile]
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleConfigChange = useCallback((newConfig: FlyerConfig) => {
    setView((prev) => ({
      ...prev,
      config: newConfig,
    }));
  }, []);

  const handleExport = async (format: 'jpg' | 'pdf') => {
    if (!flyerRef.current) {
      console.error('❌ Referência do Flyer não encontrada.');
      return;
    }

    console.log('🚀 Starting export:', format.toUpperCase());
    setIsExporting((prev) => ({ ...prev, [format]: true }));

    try {
      const element = flyerRef.current;
      const fileName = view.state === 'preview' ? view.config?.title.replace(/ /g, '_') : 'encarte';

      console.log('📋 Element to export:', element);
      console.log('📁 Filename:', fileName);

      if (format === 'pdf') {
        await exportElementAsPDF(element, `${fileName}.pdf`);
      } else {
        await exportElementAsImage(element, `${fileName}.jpg`);
      }

      toast({
        title: '✅ Sucesso!',
        description: `Encarte exportado como ${format.toUpperCase()} com sucesso!`,
        variant: 'success',
      });
    } catch (error) {
      console.error(`❌ Erro ao exportar para ${format.toUpperCase()}:`, error);
      toast({
        title: '❌ Erro',
        description: `Houve um erro ao tentar exportar para ${format.toUpperCase()}.`,
        variant: 'destructive',
      });
    } finally {
      setIsExporting((prev) => ({ ...prev, [format]: false }));
    }
  };

  // Render Logic
  const renderContent = () => {
    switch (view.state) {
      case 'upload':
        return (
          <div className="w-full min-h-screen px-4 py-8 bg-background">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Upload de Planilha</h1>
                    <p className="text-muted-foreground">Faça upload de uma planilha Excel para criar seu encarte</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ThemeToggle />
                </div>
              </div>

              <Card className="p-8">
                <CardContent className="p-0">
                  <div
                    className={`text-center border-2 border-dashed rounded-lg p-8 transition-colors ${
                      dragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50'
                    }`}
                    role="button"
                    tabIndex={0}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload')?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        document.getElementById('file-upload')?.click();
                      }
                    }}
                  >
                    <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold mb-2">Selecione sua planilha Excel</h3>
                    <p className="text-muted-foreground mb-6">
                      {dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para selecionar'}
                    </p>

                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" onClick={(e) => e.stopPropagation()}>
                      <Button asChild className="cursor-pointer">
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Selecionar Arquivo
                        </span>
                      </Button>
                    </label>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg mt-8">
                    <h4 className="font-medium mb-2 text-sm">📋 Formato esperado da planilha:</h4>
                    <div className="text-xs text-muted-foreground space-y-3">
                      <p>
                        <strong>Colunas obrigatórias (nesta ordem):</strong>
                      </p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li>
                          <strong>Posicao:</strong> Posição no encarte (1, 2, 3... - sem limite)
                        </li>
                        <li>
                          <strong>Codigo:</strong> Código único do produto (ex: 1408177, ABC123)
                        </li>
                        <li>
                          <strong>Preco:</strong> Preço do produto (ex: 10,50 ou 10.50)
                        </li>
                        <li>
                          <strong>Descricao:</strong> Nome/descrição do produto
                        </li>
                        <li>
                          <strong>Diferencial:</strong> Especificações técnicas (ex: 5MX19MM, 3/8")
                        </li>
                        <li>
                          <strong>Imagem:</strong> Nome do arquivo de imagem (sem extensão)
                        </li>
                      </ul>

                      <div className="bg-background p-3 rounded">
                        <p className="font-medium mb-2">🎯 Layout do Encarte (4x3 = 12 posições por página):</p>
                        <div className="grid grid-cols-4 gap-1 text-center text-xs font-mono">
                          <div className="bg-primary/10 p-1 rounded">1</div>
                          <div className="bg-primary/10 p-1 rounded">2</div>
                          <div className="bg-primary/10 p-1 rounded">3</div>
                          <div className="bg-primary/10 p-1 rounded">4</div>
                          <div className="bg-primary/10 p-1 rounded">5</div>
                          <div className="bg-primary/10 p-1 rounded">6</div>
                          <div className="bg-primary/10 p-1 rounded">7</div>
                          <div className="bg-primary/10 p-1 rounded">8</div>
                          <div className="bg-primary/10 p-1 rounded">9</div>
                          <div className="bg-primary/10 p-1 rounded">10</div>
                          <div className="bg-primary/10 p-1 rounded">11</div>
                          <div className="bg-primary/10 p-1 rounded">12</div>
                        </div>
                      </div>

                      <p className="pt-1">
                        <strong>Exemplo de dados com os 3 tipos de agrupamento:</strong>
                      </p>
                      <div className="bg-background p-2 rounded text-xs font-mono">
                        <div className="w-full overflow-x-auto">
                          <table className="w-full min-w-max">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-1 whitespace-nowrap">Posicao</th>
                                <th className="text-left p-1 whitespace-nowrap">Codigo</th>
                                <th className="text-left p-1 whitespace-nowrap">Preco</th>
                                <th className="text-left p-1 whitespace-nowrap">Descricao</th>
                                <th className="text-left p-1 whitespace-nowrap">Diferencial</th>
                                <th className="text-left p-1 whitespace-nowrap">Imagem</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-muted">
                              {/* Produto Único */}
                              <tr>
                                <td className="p-1 whitespace-nowrap">1</td>
                                <td className="p-1 whitespace-nowrap">1408177</td>
                                <td className="p-1 whitespace-nowrap">6,69</td>
                                <td className="p-1 whitespace-nowrap">FURADEIRA IMPACTO</td>
                                <td className="p-1 whitespace-nowrap">750W</td>
                                <td className="p-1 whitespace-nowrap">1408177</td>
                              </tr>
                              {/* Mesmo Preço - 3 produtos */}
                              <tr>
                                <td className="p-1 whitespace-nowrap">2</td>
                                <td className="p-1 whitespace-nowrap">PAR001</td>
                                <td className="p-1 whitespace-nowrap">15,50</td>
                                <td className="p-1 whitespace-nowrap">PORCA SEXTAVADA</td>
                                <td className="p-1 whitespace-nowrap">M6</td>
                                <td className="p-1 whitespace-nowrap">porca_m6</td>
                              </tr>
                              <tr>
                                <td className="p-1 whitespace-nowrap">2</td>
                                <td className="p-1 whitespace-nowrap">PAR002</td>
                                <td className="p-1 whitespace-nowrap">15,50</td>
                                <td className="p-1 whitespace-nowrap">PORCA SEXTAVADA</td>
                                <td className="p-1 whitespace-nowrap">M8</td>
                                <td className="p-1 whitespace-nowrap">porca_m6</td>
                              </tr>
                              <tr>
                                <td className="p-1 whitespace-nowrap">2</td>
                                <td className="p-1 whitespace-nowrap">PAR003</td>
                                <td className="p-1 whitespace-nowrap">15,50</td>
                                <td className="p-1 whitespace-nowrap">PORCA SEXTAVADA</td>
                                <td className="p-1 whitespace-nowrap">M10</td>
                                <td className="p-1 whitespace-nowrap">porca_m6</td>
                              </tr>
                              {/* Preços Diferentes - 2 produtos */}
                              <tr>
                                <td className="p-1 whitespace-nowrap">3</td>
                                <td className="p-1 whitespace-nowrap">PARA001</td>
                                <td className="p-1 whitespace-nowrap">8,90</td>
                                <td className="p-1 whitespace-nowrap">PARAFUSO PHILLIPS</td>
                                <td className="p-1 whitespace-nowrap">3,5x25mm</td>
                                <td className="p-1 whitespace-nowrap">parafuso_1</td>
                              </tr>
                              <tr>
                                <td className="p-1 whitespace-nowrap">3</td>
                                <td className="p-1 whitespace-nowrap">PARA002</td>
                                <td className="p-1 whitespace-nowrap">12,90</td>
                                <td className="p-1 whitespace-nowrap">PARAFUSO PHILLIPS</td>
                                <td className="p-1 whitespace-nowrap">4,0x30mm</td>
                                <td className="p-1 whitespace-nowrap">parafuso_1</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 text-xs">
                        <p className="font-medium">📝 Exemplos acima mostram:</p>
                        <ul className="ml-4 space-y-1">
                          <li>
                            • <strong>Posição 1:</strong> Produto único (Furadeira)
                          </li>
                          <li>
                            • <strong>Posição 2:</strong> Mesmo preço (3 porcas diferentes, R$ 15,50 cada)
                          </li>
                          <li>
                            • <strong>Posição 3:</strong> Preços diferentes (2 parafusos, R$ 8,90 e R$ 12,90)
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs italic">
                          💡 <strong>Agrupamento automático:</strong>
                        </p>
                        <ul className="text-xs italic ml-4 space-y-1">
                          <li>
                            • <strong>Mesmo preço:</strong> Produtos na mesma posição com preço igual
                          </li>
                          <li>
                            • <strong>Preços diferentes:</strong> Produtos na mesma posição com preços distintos
                          </li>
                          <li>
                            • <strong>Produto único:</strong> Um produto por posição
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8">
                <TemplateDownloadPanel />
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="w-full min-h-screen px-4 py-8 overflow-x-auto bg-background">
            <div className="flex items-center justify-between mb-8 max-w-[1640px] mx-auto">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => setView({ state: 'upload' })}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Editor de Encarte</h1>
                  <p className="text-muted-foreground">Personalize e exporte seu encarte promocional</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-col gap-8 max-w-[1640px] mx-auto">
              {/* Config Panel */}
              <div className="w-full flex justify-center">
                <Card className="w-[1240px]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Configurações</span>
                    </CardTitle>
                    <CardDescription>Personalize o título, cores e textos do seu encarte</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConfigPanel config={view.config!} onConfigChange={handleConfigChange} />
                  </CardContent>
                </Card>
              </div>
              {/* Preview Panel */}
              {view.groups && view.groups.length > 12 ? (
                // Multi-flyer preview - no Card wrapper to allow independent containers
                <div className="w-full">
                  <MultiFlyerPreview ref={flyerRef} config={view.config!} groups={view.groups!} />
                </div>
              ) : (
                // Single flyer preview - keep Card wrapper
                <div className="w-full flex justify-center">
                  <Card className="w-fit">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Eye className="h-5 w-5" />
                          <CardTitle>Visualização</CardTitle>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting.pdf}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>{isExporting.pdf ? 'Exportando...' : 'PDF'}</span>
                          </Button>
                          <Button
                            onClick={() => handleExport('jpg')}
                            disabled={isExporting.jpg}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                          >
                            <Download className="h-4 w-4" />
                            <span>{isExporting.jpg ? 'Exportando...' : 'JPG'}</span>
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Preview do seu encarte promocional</CardDescription>
                    </CardHeader>
                    <CardContent
                      className="flex items-center justify-center overflow-auto p-0"
                      style={{ maxWidth: 'none', maxHeight: 'none' }}
                    >
                      <FlyerPreview ref={flyerRef} config={view.config!} groups={view.groups!} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="navas-theme">
      <div className="min-h-screen bg-background text-foreground">{renderContent()}</div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
