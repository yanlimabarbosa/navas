import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getProjects, deleteProject, getProjectById, FullProject } from '../api/projects';
import { Save, FolderOpen, Download, Upload, Trash2, Calendar, Edit3 } from 'lucide-react';
import { ProjectManager as PM } from '../utils/projectManager'; // TODO: Remove once local storage is fully deprecated
import { SavedProject, FlyerConfig, ProductGroup, Product } from '../types';

interface ProjectManagerProps {
  currentConfig: FlyerConfig;
  currentGroups: ProductGroup[];
  currentProducts: Product[];
  onLoadProject: (project: SavedProject) => void;
  onSaveSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  currentConfig,
  currentGroups,
  currentProducts,
  onLoadProject,
  onSaveSuccess,
  onError
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const { data: savedProjects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 1000 * 60, // 1 minute
    enabled: false // fetch when modal opens
  });
  const [activeTab, setActiveTab] = useState<'save' | 'load'>('save');

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      refetchProjects();
      onSaveSuccess('Projeto excluído com sucesso!');
    },
    onError: () => {
      onError('Erro ao excluir projeto');
    }
  });

  const refreshProjects = useCallback(() => {
    refetchProjects();
  }, [refetchProjects]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    refreshProjects();
    setProjectName(`Projeto ${new Date().toLocaleDateString('pt-BR')}`);
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      onError('Nome do projeto é obrigatório');
      return;
    }

    // Build project DTO
    const projectToSave = {
      name: projectName.trim(),
      config: currentConfig,
      groups: currentGroups,
      products: currentProducts,
    } as SavedProject;

    console.log("ProjectToSave",projectToSave)

    // Note: This will be handled by the parent component's save logic
    onSaveSuccess('Use o botão "Salvar Encarte" na tela principal para salvar o projeto');
    setIsModalOpen(false);
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const apiProject = await getProjectById(projectId);
      
      // Convert API project to local SavedProject format
      const localProject: SavedProject = {
        id: apiProject.id,
        name: apiProject.name,
        config: {
          ...apiProject.config,
          createdAt: new Date(apiProject.config.createdAt || new Date()),
          updatedAt: new Date(apiProject.config.updatedAt || new Date())
        },
        groups: apiProject.groups,
        products: apiProject.groups.flatMap(group => group.products),
        createdAt: new Date(apiProject.updatedAt), // Use updatedAt as fallback for createdAt
        updatedAt: new Date(apiProject.updatedAt)
      };
      
      onLoadProject(localProject);
      setIsModalOpen(false);
      onSaveSuccess(`Projeto "${localProject.name}" carregado com sucesso!`);
    } catch (error) {
      onError('Erro ao carregar projeto');
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      deleteMutation.mutate(projectId);
    }
  };

  const handleExportProject = (project: SavedProject) => {
    try {
      PM.exportProject(project);
      onSaveSuccess('Projeto exportado com sucesso!');
    } catch {
      onError('Erro ao exportar projeto');
    }
  };

  const handleImportProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedProject = await PM.importProject(file);
      refreshProjects();
      onSaveSuccess(`Projeto "${importedProject.name}" importado com sucesso!`);
    } catch {
      onError('Erro ao importar projeto');
    }
    
    // Reset input
    e.target.value = '';
  };

  if (!isModalOpen) {
    return (
      <button
        onClick={handleOpenModal}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-colors"
      >
        <FolderOpen className="w-4 h-4" />
        <span>Gerenciar Projetos</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Gerenciamento de Projetos</h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('save')}
              className={`pb-2 px-1 font-medium ${
                activeTab === 'save'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Salvar Projeto
            </button>
            <button
              onClick={() => setActiveTab('load')}
              className={`pb-2 px-1 font-medium ${
                activeTab === 'load'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Carregar Projeto
            </button>
          </div>

          {/* Save Tab */}
          {activeTab === 'save' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Digite o nome do projeto..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Resumo do Projeto Atual:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Título: {currentConfig.title}</li>
                  <li>• Produtos: {currentProducts.length}</li>
                  <li>• Quadrantes preenchidos: {currentGroups.length}/12</li>
                  <li>• Última modificação: {currentConfig.updatedAt.toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProject}
                  disabled={!projectName.trim()}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Projeto</span>
                </button>
              </div>
            </div>
          )}

          {/* Load Tab */}
          {activeTab === 'load' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Projetos Salvos ({savedProjects.length})
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportProject}
                    className="hidden"
                    id="import-project"
                  />
                  <label
                    htmlFor="import-project"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 cursor-pointer flex items-center space-x-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Importar</span>
                  </label>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {savedProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum projeto salvo encontrado</p>
                  </div>
                ) : (
                  savedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(project.updatedAt).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleLoadProject(project.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Carregar</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};