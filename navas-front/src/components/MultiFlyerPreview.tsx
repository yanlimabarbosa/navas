import { forwardRef, useState } from 'react';
import { FlyerPreview } from './FlyerPreview';
import { ProductGroup, FlyerConfig, QUADRANTS_PER_FLYER } from '../types';
import { Button } from './ui/button';
import { Download, Eye, FileText } from 'lucide-react';
import {
  exportElementAsImage,
  exportElementAsPDF,
  exportElementAsImageBatch,
  exportElementAsPDFBatch,
} from '../utils/htmlExporter';
import { Card } from './ui/card';
import { useToast } from '../hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface MultiFlyerPreviewProps {
  groups: ProductGroup[];
  config: FlyerConfig;
  className?: string;
}

export const MultiFlyerPreview = forwardRef<HTMLDivElement, MultiFlyerPreviewProps>(
  ({ groups, config, className = '' }, ref) => {
    const { toast } = useToast();
    const [exportingPages, setExportingPages] = useState<Record<number, { pdf: boolean; jpg: boolean }>>({});
    const [exportingAll, setExportingAll] = useState<{ pdf: boolean; jpg: boolean; 'split-pdf': boolean }>({
      pdf: false,
      jpg: false,
      'split-pdf': false,
    });

    // Group products by flyer page
    const flyerPages = groups.reduce(
      (acc, group) => {
        const pageNumber = group.flyerPage || 1;
        if (!acc[pageNumber]) {
          acc[pageNumber] = [];
        }
        acc[pageNumber].push(group);
        return acc;
      },
      {} as Record<number, ProductGroup[]>
    );

    // Sort pages by page number
    const sortedPages = Object.keys(flyerPages)
      .map(Number)
      .sort((a, b) => a - b);

    const handleExportPage = async (pageNumber: number, format: 'pdf' | 'jpg') => {
      const pageElement = document.querySelector(`[data-flyer-page="${pageNumber}"] .flyer-content`) as HTMLElement;
      if (!pageElement) return;

      setExportingPages((prev) => ({
        ...prev,
        [pageNumber]: { ...prev[pageNumber], [format]: true },
      }));

      try {
        const fileName = `${config.title || 'encarte'}-page-${pageNumber}`;

        if (format === 'pdf') {
          await exportElementAsPDF(pageElement, `${fileName}.pdf`);
        } else {
          await exportElementAsImage(pageElement, `${fileName}.jpg`);
        }
      } catch (error) {
        console.error(`Error exporting page ${pageNumber} as ${format}:`, error);
      } finally {
        setExportingPages((prev) => ({
          ...prev,
          [pageNumber]: { ...prev[pageNumber], [format]: false },
        }));
      }
    };

    const handleExportAll = async (format: 'pdf' | 'jpg' | 'split-pdf') => {
      if (!ref || typeof ref === 'function') return;
      const containerElement = ref.current;
      if (!containerElement) return;

      setExportingAll((prev) => ({ ...prev, [format]: true }));

      try {
        const fileName = `${config.title || 'encarte'}`;

        if (format === 'pdf') {
          await exportElementAsPDF(containerElement, `${fileName}.pdf`);
        } else if (format === 'split-pdf') {
          // Use batch export for PDFs to allow directory selection
          await exportElementAsPDFBatch(containerElement, fileName);

          toast({
            title: '✅ Sucesso!',
            description: `Todos os PDFs foram salvos na pasta selecionada!`,
            variant: 'default',
          });
        } else {
          // Use batch export for JPGs to allow directory selection
          await exportElementAsImageBatch(containerElement, fileName);

          toast({
            title: '✅ Sucesso!',
            description: `Todas as imagens foram salvas na pasta selecionada!`,
            variant: 'default',
          });
        }
      } catch (error) {
        console.error(`Error exporting all pages as ${format}:`, error);

        const errorMessage = error instanceof Error ? error.message : `Erro ao exportar ${format.toUpperCase()}`;

        toast({
          title: '❌ Erro',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setExportingAll((prev) => ({ ...prev, [format]: false }));
      }
    };

    return (
      <TooltipProvider>
        <div ref={ref} className={`${className}`}>
          <Card className="w-full flex justify-center mb-12 flex-col items-center max-w-[1240px] mx-auto pt-6">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Eye className="h-5 w-5" />
                <h2 className="text-xl font-semibold">Visualização</h2>
              </div>
              <p className="text-sm text-muted-foreground">Preview do seu encarte promocional</p>
            </div>
            <div className="text-center p-6 bg-accent border border-border shadow-sm w-full">
              <h4 className="text-lg font-semibold text-foreground mb-3">📄 Exportar Todas as Páginas</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Baixe todas as {sortedPages.length} página{sortedPages.length > 1 ? 's' : ''} do encarte de uma vez
              </p>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => handleExportAll('pdf')}
                  disabled={exportingAll.pdf}
                  variant="outline"
                  size="lg"
                  className="flex items-center space-x-3 px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{exportingAll.pdf ? 'Gerando PDF...' : 'PDF Completo'}</span>
                </Button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleExportAll('split-pdf')}
                      disabled={exportingAll['split-pdf']}
                      variant="outline"
                      size="lg"
                      className="flex items-center space-x-3 px-6 py-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{exportingAll['split-pdf'] ? 'Salvando...' : 'PDFs'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Selecione uma pasta para salvar todos os PDFs separados</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleExportAll('jpg')}
                      disabled={exportingAll.jpg}
                      variant="outline"
                      size="lg"
                      className="flex items-center space-x-3 px-6 py-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Download className="h-5 w-5" />
                      <span className="font-medium">{exportingAll.jpg ? 'Salvando...' : 'JPGs'}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Selecione uma pasta para salvar todas as imagens JPG</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </Card>

          {sortedPages.map((pageNumber, index) => {
            const pageGroups = flyerPages[pageNumber];
            const isExporting = exportingPages[pageNumber] || { pdf: false, jpg: false };

            return (
              <div key={pageNumber} className={`w-full flex justify-center ${index > 0 ? 'mt-20' : ''}`}>
                <div
                  className="flyer-page border border-border rounded-lg bg-background shadow-lg overflow-hidden max-w-fit"
                  data-flyer-page={pageNumber}
                >
                  <div className="bg-muted/50 px-6 py-4 border-b border-border">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Página {pageNumber} do Encarte</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pageGroups.length} de {QUADRANTS_PER_FLYER} posições utilizadas
                      </p>

                      <div className="flex justify-center space-x-2">
                        <Button
                          onClick={() => handleExportPage(pageNumber, 'pdf')}
                          disabled={isExporting.pdf}
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <Download className="h-4 w-4" />
                          <span>{isExporting.pdf ? 'Exportando...' : 'PDF'}</span>
                        </Button>
                        <Button
                          onClick={() => handleExportPage(pageNumber, 'jpg')}
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
                  </div>

                  <div className="flyer-content">
                    <FlyerPreview groups={pageGroups} config={config} className="mb-0" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }
);

MultiFlyerPreview.displayName = 'MultiFlyerPreview';
