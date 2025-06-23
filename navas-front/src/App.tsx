import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { FlyerPreview } from './components/FlyerPreview';
import { ConfigPanel } from './components/ConfigPanel';
import { ProductGroup, FlyerConfig } from './types';
import { processExcelFile } from './utils/excelProcessor';
import { getProjects, saveOrUpdateProject, getProjectById, ProjectSummary, SaveProjectPayload } from './api/projects';
import { PDFGenerator } from './utils/pdfGenerator';

const defaultConfig: Omit<FlyerConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Encarte de Ofertas',
  headerText: 'Ofertas Válidas emquanto durarem os estoques.',
  footerText: 'Imagens meramente ilustrativas.',
  backgroundColor: '#FFFFFF',
  primaryColor: '#d91e2b',
  secondaryColor: '#2b3990',
  headerImageUrl: undefined,
  footerImageUrl: undefined,
};

type View = 
  | { state: 'dashboard' }
  | { state: 'upload' }
  | { state: 'preview'; groups: ProductGroup[]; config: FlyerConfig; currentProjectId?: string };

function App() {
  const [view, setView] = useState<View>({ state: 'dashboard' });
  const queryClient = useQueryClient();
  const flyerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const { data: projects, isLoading: isLoadingProjects } = useQuery<ProjectSummary[]>({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: ({ payload, projectId }: { payload: SaveProjectPayload; projectId?: string }) => {
      console.log('Mutation called with:', { payload, projectId });
      return saveOrUpdateProject(payload, projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setView({ state: 'dashboard' });
    },
  });

  // Handlers
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const processedGroups = await processExcelFile(file);
      if (processedGroups.length > 0) {
        setView({ 
          state: 'preview', 
          groups: processedGroups,
          config: { ...defaultConfig, id: '', createdAt: new Date(), updatedAt: new Date() },
          currentProjectId: undefined
        });
      } else {
        alert("Nenhum produto encontrado na planilha.");
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleConfigChange = (newConfig: FlyerConfig) => {
    if (view.state === 'preview') {
      console.log('handleConfigChange - currentProjectId before:', view.currentProjectId);
      setView({ ...view, config: newConfig });
      console.log('handleConfigChange - currentProjectId after:', view.currentProjectId);
    }
  };

  const handleSaveProject = () => {
    if (view.state !== 'preview') return;
    
    const projectName = view.config.title; 
    
    if (!projectName || projectName.trim() === '') {
      alert("Por favor, defina um 'Título do Encarte' no painel de configurações antes de salvar.");
      return;
    }

    const payload: SaveProjectPayload = {
      name: projectName,
      config: view.config,
      groups: view.groups,
    };
    
    console.log('handleSaveProject called with currentProjectId:', view.currentProjectId);
    
    saveMutation.mutate({ 
      payload, 
      projectId: view.currentProjectId 
    });
  };
  
  const handleLoadProject = async (id: string) => {
    try {
        const project = await getProjectById(id);
        setView({ 
          state: 'preview', 
          groups: project.groups, 
          config: project.config,
          currentProjectId: project.id 
        });
    } catch (err) {
        alert("Erro ao carregar o projeto.");
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
      const fileName = view.state === 'preview' ? view.config.title.replace(/ /g, '_') : 'encarte';
      
      if (format === 'pdf') {
        await PDFGenerator.generateFromElement(element, fileName);
      } else {
        await PDFGenerator.generateJPG(element, fileName);
      }
    } catch (error) {
      console.error(`Erro ao exportar para ${format.toUpperCase()}:`, error);
      alert(`Houve um erro ao tentar exportar para ${format.toUpperCase()}.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Render Logic
  const renderContent = () => {
    switch (view.state) {
      case 'dashboard':
        return (
          <div className="w-full max-w-2xl ml-auto mr-auto">
            <h1 className="text-3xl font-bold text-center mb-6">Meus Encartes</h1>
            <button
              onClick={() => setView({ state: 'upload' })}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mb-6"
            >
              + Criar Novo Encarte (do Excel)
            </button>
            <div className="space-y-3">
              {isLoadingProjects && <p>Carregando projetos...</p>}
              {projects?.map(p => (
                <div key={p.id} onClick={() => handleLoadProject(p.id)} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-sm text-gray-500">
                    Atualizado em: {new Date(p.updatedAt).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'upload':
        return (
          <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl text-center mr-auto ml-auto">
            <h1 className="text-2xl font-bold mb-6 mr-auto ml-auto">Selecione a Planilha</h1>
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
            <button onClick={() => setView({ state: 'dashboard' })} className="text-sm text-gray-500 mt-6">
              Voltar
            </button>
          </div>
        );

      case 'preview':
        return (
          <div className="w-full max-w-screen-xl mx-auto">
            <div className="w-full flex justify-between items-center mb-6">
              <button onClick={() => setView({ state: 'dashboard' })} className="bg-gray-200 py-2 px-4 rounded-lg">
                  &larr; Voltar ao Dashboard
              </button>
              <div className="flex items-center gap-4">
                <button
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                    {isExporting ? 'Exportando...' : 'Exportar como PDF'}
                </button>
                <button
                    onClick={() => handleExport('jpg')}
                    disabled={isExporting}
                    className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                    {isExporting ? 'Exportando...' : 'Exportar como JPG'}
                </button>
                <button
                    onClick={handleSaveProject}
                    disabled={saveMutation.isPending}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    {saveMutation.isPending ? 'Salvando...' : view.currentProjectId ? 'Atualizar Encarte' : 'Salvar Encarte'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <ConfigPanel config={view.config} onConfigChange={handleConfigChange} />
              </div>
              <div className="lg:col-span-2 flex justify-center items-start">
                  <div className="transform scale-90 origin-top">
                    <FlyerPreview ref={flyerRef} config={view.config} groups={view.groups} />
                  </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full p-8">
      {renderContent()}
    </div>
  );
}

export default App;