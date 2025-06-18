import React, { useState, useRef, useCallback } from 'react';
import { FileText, Download, Image, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { FileUploader } from './components/FileUploader';
import { ProductCard } from './components/ProductCard';
import { FlyerPreview } from './components/FlyerPreview';
import { ProductEditor } from './components/ProductEditor';
import { ConfigPanel } from './components/ConfigPanel';
import { ProjectManager } from './components/ProjectManager';
import { PDFGenerator } from './utils/pdfGenerator';
import { Product, ProductGroup, FlyerConfig, SavedProject } from './types';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [config, setConfig] = useState<FlyerConfig>({
    id: 'flyer-1',
    title: 'Encarte Promocional',
    headerText: 'Ofertas válidas até 31/01/2025',
    footerText: 'Consulte condições especiais em nossa loja',
    backgroundColor: '#ffffff',
    primaryColor: '#dc2626',
    secondaryColor: '#1e40af',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [currentStep, setCurrentStep] = useState<'upload' | 'design' | 'preview'>('upload');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<number>(0);
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const flyerRef = useRef<HTMLDivElement>(null);

  const handleProductsLoaded = useCallback((loadedProducts: Product[]) => {
    setProducts(loadedProducts);
    setSuccess(`${loadedProducts.length} produtos carregados com sucesso!`);
    setError('');
    setCurrentStep('design');
    
    // Auto-generate some groups for demonstration
    const autoGroups: ProductGroup[] = loadedProducts.slice(0, 12).map((product, index) => ({
      id: `auto-group-${index}`,
      type: 'single',
      products: [product],
      position: index
    }));
    
    setGroups(autoGroups);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  }, []);

  const handleSuccess = useCallback((successMessage: string) => {
    setSuccess(successMessage);
    setError('');
  }, []);

  const handleEditGroup = (position: number) => {
    const existingGroup = groups.find(g => g.position === position);
    setEditingGroup(existingGroup || null);
    setEditingPosition(position);
    setIsEditorOpen(true);
  };

  const handleSaveGroup = (group: ProductGroup) => {
    setGroups(prev => {
      const filtered = prev.filter(g => g.position !== group.position);
      return [...filtered, group];
    });
    setSuccess('Quadrante salvo com sucesso!');
    setError('');
  };

  const handleLoadProject = (project: SavedProject) => {
    setConfig(project.config);
    setGroups(project.groups);
    setProducts(project.products);
    setCurrentStep('design');
  };

  const handleExportPDF = async () => {
    if (!flyerRef.current) return;
    
    setIsExporting(true);
    try {
      await PDFGenerator.generateFromElement(flyerRef.current, config.title);
      setSuccess('PDF gerado com sucesso!');
    } catch (error) {
      setError('Erro ao gerar PDF');
    }
    setIsExporting(false);
  };

  const handleExportJPG = async () => {
    if (!flyerRef.current) return;
    
    setIsExporting(true);
    try {
      await PDFGenerator.generateJPG(flyerRef.current, config.title);
      setSuccess('JPG gerado com sucesso!');
    } catch (error) {
      setError('Erro ao gerar JPG');
    }
    setIsExporting(false);
  };

  const renderStepIndicator = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'upload' ? 'bg-blue-100' : 'bg-green-100'
          }`}>
            {currentStep === 'upload' ? '1' : <CheckCircle className="w-5 h-5" />}
          </div>
          <span className="font-medium">Upload da Planilha</span>
        </div>
        
        <div className={`w-16 h-1 rounded ${
          currentStep !== 'upload' ? 'bg-green-500' : 'bg-gray-200'
        }`} />
        
        <div className={`flex items-center space-x-2 ${
          currentStep === 'design' ? 'text-blue-600' : 
          currentStep === 'preview' ? 'text-green-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'design' ? 'bg-blue-100' : 
            currentStep === 'preview' ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {currentStep === 'preview' ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <span className="font-medium">Design do Encarte</span>
        </div>
        
        <div className={`w-16 h-1 rounded ${
          currentStep === 'preview' ? 'bg-green-500' : 'bg-gray-200'
        }`} />
        
        <div className={`flex items-center space-x-2 ${
          currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            currentStep === 'preview' ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            3
          </div>
          <span className="font-medium">Preview & Export</span>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-2 mb-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700">{success}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Sistema de Promoções NAVAS</h1>
          </div>
          <p className="text-xl text-gray-600">
            Crie encartes promocionais profissionais automaticamente
          </p>
        </div>

        {renderStepIndicator()}
        {renderNotifications()}

        {/* Upload Step */}
        {currentStep === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Upload da Planilha de Produtos
                </h2>
                <ProjectManager
                  currentConfig={config}
                  currentGroups={groups}
                  currentProducts={products}
                  onLoadProject={handleLoadProject}
                  onSaveSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>
              <FileUploader 
                onProductsLoaded={handleProductsLoaded}
                onError={handleError}
              />
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Formato da Planilha:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Coluna A: Código do Produto</li>
                  <li>• Coluna B: Descrição do Produto</li>
                  <li>• Coluna C: Preço (formato numérico)</li>
                  <li>• Primeira linha pode ser cabeçalho (será ignorada)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Design Step */}
        {currentStep === 'design' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Configuration Panel */}
            <div className="xl:col-span-1">
              <ConfigPanel config={config} onConfigChange={setConfig} />
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => setCurrentStep('preview')}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Visualizar Encarte
                </button>
                <ProjectManager
                  currentConfig={config}
                  currentGroups={groups}
                  currentProducts={products}
                  onLoadProject={handleLoadProject}
                  onSaveSuccess={handleSuccess}
                  onError={handleError}
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Design do Encarte (12 Quadrantes)
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 12 }, (_, index) => {
                    const group = groups.find(g => g.position === index);
                    return (
                      <div key={index} className="aspect-square">
                        {group ? (
                          <ProductCard 
                            group={group} 
                            onEdit={() => handleEditGroup(index)}
                          />
                        ) : (
                          <div 
                            className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                            onClick={() => handleEditGroup(index)}
                          >
                            <div className="text-center">
                              <div className="text-2xl text-gray-400 mb-2">+</div>
                              <span className="text-sm text-gray-500">
                                Quadrante {index + 1}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Preview do Encarte</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('design')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Voltar ao Design
                </button>
                <ProjectManager
                  currentConfig={config}
                  currentGroups={groups}
                  currentProducts={products}
                  onLoadProject={handleLoadProject}
                  onSaveSuccess={handleSuccess}
                  onError={handleError}
                />
                <button
                  onClick={handleExportJPG}
                  disabled={isExporting}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />}
                  <span>Exportar JPG</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>Exportar PDF</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center">
              <FlyerPreview 
                ref={flyerRef}
                groups={groups} 
                config={config}
                className="transform scale-75 origin-top"
              />
            </div>
          </div>
        )}

        {/* Product Editor Modal */}
        <ProductEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          products={products}
          group={editingGroup}
          onSave={handleSaveGroup}
          position={editingPosition}
        />
      </div>
    </div>
  );
}

export default App;