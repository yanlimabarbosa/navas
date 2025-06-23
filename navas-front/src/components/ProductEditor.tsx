import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Product, ProductGroup } from '../types';

interface ProductEditorProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  group?: ProductGroup | null;
  onSave: (group: ProductGroup) => void;
  position: number;
}

export const ProductEditor: React.FC<ProductEditorProps> = ({
  isOpen,
  onClose,
  products,
  group,
  onSave,
  position
}) => {
  const [editingGroup, setEditingGroup] = useState<ProductGroup>({
    id: group?.id || `group-${Date.now()}`,
    groupType: group?.groupType || 'single',
    title: group?.title || '',
    image: group?.image || '',
    products: group?.products || [],
    position
  });

  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditingGroup({
        id: group?.id || `group-${Date.now()}`,
        groupType: group?.groupType || 'single',
        title: group?.title || '',
        image: group?.image || '',
        products: group?.products || [],
        position
      });
      setAvailableProducts(products.filter(p => 
        !(group?.products || []).find(gp => gp.id === p.id)
      ));
    }
  }, [isOpen, products, group, position]);

  const filteredProducts = availableProducts.filter(product =>
    (product.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = (product: Product) => {
    setEditingGroup(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));
    setAvailableProducts(prev => prev.filter(p => p.id !== product.id));
  };

  const handleRemoveProduct = (productId: string) => {
    const productToRemove = editingGroup.products.find(p => p.id === productId);
    if (productToRemove) {
      setEditingGroup(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
      setAvailableProducts(prev => [...prev, productToRemove]);
    }
  };

  const handleSave = () => {
    if (editingGroup.products.length > 0) {
      const groupToSave = { ...editingGroup };
      if (groupToSave.groupType === 'single' && groupToSave.products.length > 0) {
        let imgPath = `imagens_produtos/${groupToSave.products[0].code}.png`;
        if (imgPath.startsWith('/')) imgPath = imgPath.slice(1);
        groupToSave.image = imgPath;
      }
      onSave(groupToSave);
      onClose();
    }
  };

  const handleSpecificationChange = (productId: string, specifications: string) => {
    setEditingGroup(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === productId ? { ...p, specifications } : p
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Configurar Quadrante {position + 1}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Quadrante
                </label>
                <select
                  value={editingGroup.groupType}
                  onChange={(e) => setEditingGroup(prev => ({ ...prev, groupType: e.target.value as ProductGroup['groupType'] }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="single">Produto Único</option>
                  <option value="same-price">Produtos com Mesmo Preço</option>
                  <option value="different-price">Produtos com Preços Diferentes</option>
                </select>
              </div>

              {(editingGroup.groupType === 'same-price' || editingGroup.groupType === 'different-price') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Grupo
                  </label>
                  <input
                    type="text"
                    value={editingGroup.title}
                    onChange={(e) => setEditingGroup(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Ferramentas Diversas"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Selected Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Produtos Selecionados ({editingGroup.products.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {editingGroup.products.map((product) => (
                    <div key={product.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.code}</p>
                          <p className="text-sm text-gray-600">{product.description}</p>
                          <p className="text-sm font-semibold text-green-600">
                            R$ {product.price.toFixed(2)}
                          </p>
                          {(editingGroup.groupType === 'same-price' || editingGroup.groupType === 'different-price') && (
                            <input
                              type="text"
                              placeholder="Especificações (ex: 220V, Azul, 10mm)"
                              value={product.specifications || ''}
                              onChange={(e) => handleSpecificationChange(product.id, e.target.value)}
                              className="mt-2 w-full text-xs border border-gray-200 rounded px-2 py-1"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {editingGroup.products.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Nenhum produto selecionado
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Product Selection Panel */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adicionar Produtos
                </label>
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{product.code}</p>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-sm font-semibold text-green-600">
                          R$ {product.price.toFixed(2)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddProduct(product)}
                        disabled={editingGroup.groupType === 'single' && editingGroup.products.length >= 1}
                        className="text-blue-500 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    {searchTerm ? 'Nenhum produto encontrado' : 'Todos os produtos já foram selecionados'}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={editingGroup.products.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Quadrante</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};