import React, { useState, useRef, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { processExcelFile } from './utils/excelProcessor';
import { FlyerPreview } from './components/FlyerPreview';
import { ConfigPanel } from './components/ConfigPanel';
import { ThemeProvider } from './components/theme-provider';
import { ThemeToggle } from './components/theme-toggle';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { 
  Download, 
  FileSpreadsheet, 
  Save, 
  Upload, 
  Settings, 
  Eye,
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react';
import { saveProject, getProjects, getProjectById, updateProject, deleteProject } from './api/projects';
import { FlyerConfig, ProductGroup, Product } from './types';
import { exportElementAsImage, exportElementAsPDF } from './utils/htmlExporter';

function App() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [view, setView] = useState<{
    state: 'dashboard' | 'upload' | 'preview';
    config?: FlyerConfig;
    groups?: ProductGroup[];
    products?: Product[];
  }>({ state: 'dashboard' });

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<{ pdf: boolean; jpg: boolean; html: boolean }>({ pdf: false, jpg: false, html: false });
  const flyerRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 0, // Immediate refetch when invalidated
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (projectData: {
      name: string;
      config: FlyerConfig;
      groups: ProductGroup[];
      products: Product[];
    }) => {
      if (currentProjectId) {
        return updateProject(currentProjectId, projectData);
      }
      return saveProject(projectData);
    },
    onSuccess: (data) => {
      if (!currentProjectId) {
        setCurrentProjectId(data.id);
      }
      toast({
        title: "Sucesso!",
        description: "Projeto salvo com sucesso!",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setView({ state: 'dashboard' });
    },
    onError: (error) => {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      setCurrentProjectId(null);
      setView({ state: 'dashboard' });
      toast({
        title: "Sucesso!",
        description: "Projeto excluído com sucesso!",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setCurrentProjectId(null);
      
      const groups = await processExcelFile(file);
      const products = groups.flatMap(group => group.products);
      
      setView({
        state: 'preview',
        config: {
          id: 'config-1',
          title: 'Encarte de Ofertas',
          headerText: 'Ofertas Válidas até 31/12/2024 ou enquanto durarem os estoques.',
          footerText: 'Imagens meramente ilustrativas. Preços válidos para todas as lojas da rede.',
          backgroundColor: '#FFFFFF',
          primaryColor: '#d91e2b',
          secondaryColor: '#2b3990',
          createdAt: new Date(),
          updatedAt: new Date(),
          headerImageUrl: '',
          footerImageUrl: '',
        },
        groups,
        products,
      });
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo. Verifique se o formato está correto.",
        variant: "destructive",
      });
    }
  };

  const handleConfigChange = useCallback((newConfig: FlyerConfig) => {
    setView(prev => ({
      ...prev,
      config: newConfig,
    }));
  }, []);

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await getProjectById(projectId);
      setCurrentProjectId(project.id);
      
      setView({
        state: 'preview',
        config: {
          ...project.config,
          createdAt: new Date(project.config.createdAt || new Date()),
          updatedAt: new Date(project.config.updatedAt || new Date())
        },
        groups: project.groups,
        products: project.groups.flatMap(group => group.products),
      });
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projeto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSaveProject = () => {
    if (!view.config || !view.groups) {
      toast({
        title: "Aviso",
        description: "Nenhum projeto para salvar",
        variant: "default",
      });
      return;
    }

    const projectData = {
      name: view.config.title,
      config: view.config,
      groups: view.groups,
      products: view.products || [],
    };

    saveMutation.mutate(projectData);
  };

  const handleDeleteProject = () => {
    if (!currentProjectId) {
      toast({
        title: "Aviso",
        description: "Nenhum projeto para excluir",
        variant: "default",
      });
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteMutation.mutate(currentProjectId);
    }
  };

  const handleExport = async (format: 'jpg' | 'pdf') => {
    if (!flyerRef.current) {
      console.error("❌ Referência do Flyer não encontrada.");
      return;
    }
    
    console.log('🚀 Starting export:', format.toUpperCase());
    setIsExporting(prev => ({ ...prev, [format]: true }));

    try {
      const element = flyerRef.current;
      const fileName = view.state === 'preview' ? view.config?.title.replace(/ /g, '_') : 'encarte';
      
      console.log('📋 Element to export:', element);
      console.log('📁 Filename:', fileName);
      
      if (format === 'pdf') {
        // 🎯 DIRECT CAPTURE - NO HTML GENERATION
        await exportElementAsPDF(element, `${fileName}.pdf`);
      } else {
        // 🎯 DIRECT CAPTURE - NO HTML GENERATION  
        await exportElementAsImage(element, `${fileName}.jpg`);
      }
      
      toast({
        title: "✅ Sucesso!",
        description: `Encarte exportado como ${format.toUpperCase()} com sucesso!`,
        variant: "success",
      });
    } catch (error) {
      console.error(`❌ Erro ao exportar para ${format.toUpperCase()}:`, error);
      toast({
        title: "❌ Erro",
        description: `Houve um erro ao tentar exportar para ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(prev => ({ ...prev, [format]: false }));
    }
  };

  // Render Logic
  const renderContent = () => {
    switch (view.state) {
      case 'dashboard':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Meus Encartes</h1>
                <p className="text-muted-foreground mt-2">Gerencie seus projetos de encartes promocionais</p>
              </div>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
                setCurrentProjectId(null); 
                setView({ state: 'upload' });
              }}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-primary" />
                    <CardTitle>Criar Novo Encarte</CardTitle>
                  </div>
                  <CardDescription>Comece um novo projeto a partir de uma planilha Excel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>Upload de Excel</span>
                  </div>
                </CardContent>
              </Card>

              {isLoadingProjects && (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </CardContent>
                </Card>
              )}

              {projects?.map(project => (
                <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleLoadProject(project.id)}>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                    <CardDescription>
                      Atualizado em: {new Date(project.updatedAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>Clique para abrir</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center space-x-4 mb-8">
                <Button variant="outline" size="icon" onClick={() => setView({ state: 'dashboard' })}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Criar Novo Encarte</h1>
                  <p className="text-muted-foreground">Selecione uma planilha Excel para começar</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload da Planilha</span>
                  </CardTitle>
                  <CardDescription>
                    Arraste um arquivo Excel aqui ou clique para selecionar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <input 
                      type="file" 
                      accept=".xlsx,.xls" 
                      onChange={handleFileChange}
                      className="w-full h-32 opacity-0 absolute inset-0 z-10 cursor-pointer"
                      title="Clique para selecionar ou arraste sua planilha"
                    />
                    <div className="w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-all hover:bg-muted/50 flex flex-col items-center justify-center gap-2 p-4">
                      <Upload className="h-8 w-8 text-muted-foreground/50" />
                      <div className="text-center">
                        <p className="font-medium text-sm">Arraste sua planilha Excel aqui</p>
                        <p className="text-xs text-muted-foreground">ou clique para selecionar do seu computador</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Formatos aceitos: .xlsx, .xls</p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-sm">📋 Formato esperado da planilha:</h4>
                    <div className="text-xs text-muted-foreground space-y-3">
                      <p><strong>Colunas obrigatórias (nesta ordem):</strong></p>
                      <ul className="list-disc list-inside ml-2 space-y-1">
                        <li><strong>Posicao:</strong> Posição no encarte (1-12)</li>
                        <li><strong>Codigo:</strong> Código único do produto (ex: 1408177, ABC123)</li>
                        <li><strong>Preco:</strong> Preço do produto (ex: 10,50 ou 10.50)</li>
                        <li><strong>Descricao:</strong> Nome/descrição do produto</li>
                        <li><strong>Diferencial:</strong> Especificações técnicas (ex: 5MX19MM, 3/8")</li>
                        <li><strong>Imagem:</strong> Nome do arquivo de imagem (sem extensão)</li>
                      </ul>
                      
                      <div className="bg-background p-3 rounded">
                        <p className="font-medium mb-2">🎯 Layout do Encarte (4x3 = 12 posições):</p>
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

                      <p className="pt-1"><strong>Exemplo de dados com os 3 tipos de agrupamento:</strong></p>
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
                          <li>• <strong>Posição 1:</strong> Produto único (Furadeira)</li>
                          <li>• <strong>Posição 2:</strong> Mesmo preço (3 porcas diferentes, R$ 15,50 cada)</li>
                          <li>• <strong>Posição 3:</strong> Preços diferentes (2 parafusos, R$ 8,90 e R$ 12,90)</li>
                        </ul>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs italic">💡 <strong>Agrupamento automático:</strong></p>
                        <ul className="text-xs italic ml-4 space-y-1">
                          <li>• <strong>Mesmo preço:</strong> Produtos na mesma posição com preço igual</li>
                          <li>• <strong>Preços diferentes:</strong> Produtos na mesma posição com preços distintos</li>
                          <li>• <strong>Produto único:</strong> Um produto por posição</li>
                        </ul>
                      </div>
                      
                      {/* <p className="text-xs italic">🖼️ <strong>Imagens:</strong> Devem estar em <code>public/imagens_produtos/[nome].png</code></p> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="w-full min-h-screen px-4 py-8 overflow-x-auto bg-background">
            <div className="flex items-center justify-between mb-8 max-w-[1640px] mx-auto">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={() => setView({ state: 'dashboard' })}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Editor de Encarte</h1>
                  <p className="text-muted-foreground">Personalize e exporte seu encarte promocional</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSaveProject}
                  disabled={saveMutation.isPending}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saveMutation.isPending ? 'Salvando...' : (currentProjectId ? 'Atualizar' : 'Salvar')}</span>
                </Button>
                {currentProjectId && (
                  <Button
                    onClick={handleDeleteProject}
                    disabled={deleteMutation.isPending}
                    variant="destructive"
                    size="icon"
                    title="Excluir Projeto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
                    <CardDescription>
                      Personalize o título, cores e textos do seu encarte
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ConfigPanel config={view.config!} onConfigChange={handleConfigChange} />
                  </CardContent>
                </Card>
              </div>
              {/* Preview Panel */}
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
                        {/* HTML Export Button - Commented out per user request
                        <Button
                          onClick={async () => {
                            if (flyerRef.current && view.config) {
                              setIsExporting(prev => ({ ...prev, html: true }));
                              try {
                                const base = (view.config.title || 'encarte');
                                const html = await exportFlyerAsHTML(flyerRef.current, base + '.html');
                                await exportFlyerHTMLAsImage(flyerRef.current, base + '.jpg', html);
                                await exportFlyerHTMLAsPDF(flyerRef.current, base + '.pdf', html);
                              } catch (err) {
                                console.error('Erro ao exportar HTML + Imagem + PDF:', err);
                                toast({
                                  title: 'Erro',
                                  description: 'Erro ao exportar. Veja o console para detalhes.',
                                  variant: 'destructive',
                                });
                              } finally {
                                setIsExporting(prev => ({ ...prev, html: false }));
                              }
                            }
                          }}
                          disabled={isExporting.html}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>Exportar HTML + Imagem + PDF</span>
                        </Button>
                        */}
                      </div>
                    </div>
                    <CardDescription>
                      Preview do seu encarte promocional
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center overflow-auto p-0" style={{ maxWidth: 'none', maxHeight: 'none' }}>
                      <FlyerPreview
                        ref={flyerRef}
                        config={view.config!}
                        groups={view.groups!}
                      />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        defaultTheme="light"
        storageKey="navas-theme"
      >
        <div className="min-h-screen bg-background text-foreground">
          {renderContent()}
        </div>
        <Toaster />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;