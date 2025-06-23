import React, { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getProjects, deleteProject, getProjectById } from '../api/projects';
import { FolderOpen, Calendar, Edit3, Trash2, X } from 'lucide-react';
import { SavedProject, FlyerConfig, ProductGroup, Product } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ProjectManagerProps {
  onLoadProject: (project: SavedProject) => void;
  onSaveSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  onLoadProject,
  onSaveSuccess,
  onError
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: savedProjects = [], refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    staleTime: 1000 * 60, // 1 minute
    enabled: isModalOpen // only fetch when modal is open
  });

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

  const handleOpenModal = () => {
    setIsModalOpen(true);
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

  if (!isModalOpen) {
    return (
      <Button
        onClick={handleOpenModal}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <FolderOpen className="w-4 h-4" />
        <span>Carregar Projeto</span>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Projetos Salvos</CardTitle>
            <CardDescription>
              {savedProjects.length} projeto{savedProjects.length !== 1 ? 's' : ''} encontrado{savedProjects.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="max-h-96 overflow-y-auto space-y-3">
          {savedProjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>Nenhum projeto salvo encontrado</p>
            </div>
          ) : (
            savedProjects.map((project) => (
              <div
                key={project.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{project.name}</h4>
                    <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(project.updatedAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => handleLoadProject(project.id)}
                      size="sm"
                      variant="outline"
                      className="flex items-center space-x-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Carregar</span>
                    </Button>
                    <Button
                      onClick={() => handleDeleteProject(project.id)}
                      size="sm"
                      variant="destructive"
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Excluir</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};