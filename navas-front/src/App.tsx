import React, { useState, useRef, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { processExcelFile } from './utils/excelProcessor';
import { FlyerPreview } from './components/FlyerPreview';
import { ConfigPanel } from './components/ConfigPanel';
import { FileUploader } from './components/FileUploader';
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
import { PDFGenerator } from './utils/pdfGenerator';
import { saveProject, getProjects, getProjectById, updateProject, deleteProject } from './api/projects';
import { FlyerConfig, ProductGroup, Product, SavedProject } from './types';

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
  const [isExporting, setIsExporting] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: projects, isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 0, // Immediate refetch when invalidated
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: (projectData: any) => {
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
      console.error("Referência do Flyer não encontrada.");
      return;
    }
    
    setIsExporting(true);

    try {
      // Usa document.fonts.ready para garantir que todas as fontes foram carregadas
      await document.fonts.ready;

      // Adiciona um pequeno delay adicional para garantir a renderização final
      await new Promise(resolve => setTimeout(resolve, 200));

      const element = flyerRef.current;
      const fileName = view.state === 'preview' ? view.config?.title.replace(/ /g, '_') : 'encarte';
      
      if (format === 'pdf') {
        await PDFGenerator.generateFromElement(element, fileName);
      } else {
        await PDFGenerator.generateJPG(element, fileName);
      }
      
      toast({
        title: "Sucesso!",
        description: `Encarte exportado como ${format.toUpperCase()} com sucesso!`,
        variant: "success",
      });
    } catch (error) {
      console.error(`Erro ao exportar para ${format.toUpperCase()}:`, error);
      toast({
        title: "Erro",
        description: `Houve um erro ao tentar exportar para ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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
              <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setView({ state: 'upload' })}>
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
                <CardContent>
                  <input 
                    type="file" 
                    accept=".xlsx,.xls" 
                    onChange={handleFileChange}
                    className="w-full p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Configurações</span>
                    </CardTitle>
                    <CardDescription>
                      Personalize o título, cores e textos do seu encarte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ConfigPanel config={view.config!} onConfigChange={handleConfigChange} />
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-5 w-5" />
                        <CardTitle>Visualização</CardTitle>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleExport('pdf')}
                          disabled={isExporting}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>{isExporting ? 'Exportando...' : 'PDF'}</span>
                        </Button>
                        <Button
                          onClick={() => handleExport('jpg')}
                          disabled={isExporting}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>{isExporting ? 'Exportando...' : 'JPG'}</span>
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Preview do seu encarte promocional
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex items-center justify-center overflow-auto">
                    <div className="transform scale-75 origin-top lg:scale-90">
                      <FlyerPreview
                        ref={flyerRef}
                        config={view.config!}
                        groups={view.groups!}
                      />
                    </div>
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