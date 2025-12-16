import * as XLSX from 'xlsx';

export const generateExcelTemplate = () => {
  // Dados de exemplo
  const templateData = [
    {
      Posicao: 1,
      Codigo: '1408177',
      Preco: 6.69,
      Descricao: 'FURADEIRA IMPACTO',
      Diferencial: '750M',
      Imagem: '1408177'
    },
    {
      Posicao: 2,
      Codigo: 'PAR001',
      Preco: 15.50,
      Descricao: 'PORCA SEXTAVADA',
      Diferencial: 'M6',
      Imagem: 'porca_m6'
    },
    {
      Posicao: 2,
      Codigo: 'PAR002',
      Preco: 15.50,
      Descricao: 'PORCA SEXTAVADA',
      Diferencial: 'M8',
      Imagem: 'porca_m8'
    },
    {
      Posicao: 2,
      Codigo: 'PAR003',
      Preco: 15.50,
      Descricao: 'PORCA SEXTAVADA',
      Diferencial: 'M10',
      Imagem: 'porca_m10'
    },
    {
      Posicao: 3,
      Codigo: 'PARA001',
      Preco: 8.90,
      Descricao: 'PARAFUSO PHILLIPS',
      Diferencial: '3,5x25mm',
      Imagem: 'parafuso_1'
    },
    {
      Posicao: 3,
      Codigo: 'PARA002',
      Preco: 12.90,
      Descricao: 'PARAFUSO PHILLIPS',
      Diferencial: '4,0x30mm',
      Imagem: 'parafuso_1'
    }
  ];

  // Criar workbook
  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Definir largura das colunas
  const columnWidths = [
    { wch: 10 }, // Posicao
    { wch: 12 }, // Codigo
    { wch: 10 }, // Preco
    { wch: 25 }, // Descricao
    { wch: 15 }, // Diferencial
    { wch: 20 }  // Imagem
  ];
  worksheet['!cols'] = columnWidths;

  // Aplicar formatação ao header
  const headerStyle = {
    fill: { fgColor: { rgb: 'FF4472C4' } },
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  // Aplicar estilo ao header
  const headerCells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1'];
  headerCells.forEach(cell => {
    if (worksheet[cell]) {
      worksheet[cell].s = headerStyle;
    }
  });

  // Criar workbook e adicionar worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');

  // Salvar arquivo
  XLSX.writeFile(workbook, 'modelo_planilha.xlsx');
};
