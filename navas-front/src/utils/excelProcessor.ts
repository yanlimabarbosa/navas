import * as XLSX from 'xlsx';
import { ProductGroup, Product, ExcelData } from '../types';

// Helper to determine the group type based on its products
function getGroupType(products: Product[]): 'single' | 'same-price' | 'different-price' {
  if (products.length === 1) {
    return 'single';
  }
  // Check if all prices are the same
  const firstPrice = products[0].price;
  const allSamePrice = products.every(p => p.price === firstPrice);
  return allSamePrice ? 'same-price' : 'different-price';
}

export const processExcelFile = (file: File): Promise<ProductGroup[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reader.abort();
      reject(new Error("Erro ao ler o arquivo."));
    };

    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) {
        return reject(new Error("Nenhum dado encontrado no arquivo."));
      }

      try {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<ExcelData>(worksheet);

        // Group rows by 'Posicao'
        const groupedByPosition = json.reduce((acc, row) => {
          const position = row.Posicao;
          if (!acc[position]) {
            acc[position] = [];
          }
          acc[position].push(row);
          return acc;
        }, {} as Record<number, ExcelData[]>);

        // Transform grouped data into ProductGroup[]
        const productGroups: ProductGroup[] = Object.entries(groupedByPosition).map(([position, rows]) => {
          const firstRow = rows[0];
          
          const products: Product[] = rows.map((row, index) => ({
            id: `prod-${position}-${index}`,
            code: String(row.Codigo),
            price: Number(String(row.Preco).replace(',', '.')), // Handle both dot and comma for decimals
            description: row.Descricao,
            specifications: row.Diferencial,
          }));

          let imgPath = `imagens_produtos/${firstRow.Codigo}.png`;
          if (imgPath.startsWith('/')) imgPath = imgPath.slice(1);
          return {
            id: `group-${position}`,
            position: Number(position),
            title: firstRow.Descricao,
            image: imgPath,
            products: products,
            groupType: getGroupType(products),
          };
        });

        resolve(productGroups);
      } catch (e) {
        console.error(e);
        reject(new Error("Formato de arquivo inválido ou planilha corrompida."));
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

export class ExcelProcessor {
  static async processFile(file: File): Promise<Product[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData: ExcelData[] = XLSX.utils.sheet_to_json(worksheet, {
        range: 1 // Skip header row
      });

      return jsonData
        .filter(row => row.Codigo && row.Descricao && row.Preco)
        .map((row, index) => ({
          id: `product-${index}`,
          code: String(row.Codigo).trim(),
          description: String(row.Descricao).trim(),
          price: Number(row.Preco) || 0,
        }));
    } catch (error) {
      console.error('Error processing Excel file:', error);
      throw new Error('Erro ao processar arquivo Excel. Verifique se o formato está correto.');
    }
  }

  static validateExcelStructure(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:C1');
          const hasMinimumColumns = range.e.c >= 2; // At least 3 columns (0-indexed)
          
          resolve(hasMinimumColumns);
        } catch {
          resolve(false);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
}