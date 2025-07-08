import * as XLSX from 'xlsx';
import { ProductGroup, Product, ExcelData } from '../types';
import { ImageProcessor } from './imageProcessor';

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

// Check if a row is a phantom row (contains invisible characters or is essentially empty)
function isPhantomRow(row: Partial<ExcelData>): boolean {
  // Check if all main fields are invisible characters, empty, or null/undefined
  const invisibleChar = '\u200B'; // Zero-width space character
  
  const posicao = String(row.Posicao || '').trim();
  const codigo = String(row.Codigo || '').trim();
  const descricao = String(row.Descricao || '').trim();
  const preco = String(row.Preco || '').trim();
  
  // If any of the main fields contains only invisible characters or is empty
  const isInvisibleOrEmpty = (value: string) => 
    !value || value === invisibleChar || value.replace(/[\u200B\s]/g, '') === '';
  
  return isInvisibleOrEmpty(posicao) && 
         isInvisibleOrEmpty(codigo) && 
         isInvisibleOrEmpty(descricao) && 
         isInvisibleOrEmpty(preco);
}

// Validate required fields in Excel data
function validateExcelRow(row: Partial<ExcelData>, rowIndex: number): string | null {
  console.log(row);
  if (!row.Posicao || typeof row.Posicao !== 'number') {
    return `Linha ${rowIndex + 2}: Posição inválida ou faltando`;
  }
  if (row.Posicao < 1 || row.Posicao > 12) {
    return `Linha ${rowIndex + 2}: Posição deve estar entre 1 e 12`;
  }
  if (!row.Codigo) {
    return `Linha ${rowIndex + 2}: Código do produto faltando`;
  }
  if (!row.Descricao) {
    return `Linha ${rowIndex + 2}: Descrição do produto faltando`;
  }
  if (!row.Preco || isNaN(Number(String(row.Preco).replace(',', '.')))) {
    return `Linha ${rowIndex + 2}: Preço inválido ou faltando`;
  }
  if (!row.Imagem) {
    return `Linha ${rowIndex + 2}: Nome da imagem faltando`;
  }
  return null;
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
        // Parse Excel file
        const workbook = XLSX.read(data, { type: 'array' });
        if (!workbook.SheetNames.length) {
          throw new Error("Arquivo Excel não contém planilhas.");
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<ExcelData>(worksheet);

        if (!rawJson.length) {
          throw new Error("Planilha está vazia ou não contém dados válidos.");
        }

        // Filter out phantom rows with invisible characters
        const json = rawJson.filter(row => !isPhantomRow(row));

        if (!json.length) {
          throw new Error("Planilha não contém dados válidos após filtrar linhas vazias.");
        }

        // Validate each row
        for (let i = 0; i < json.length; i++) {
          const error = validateExcelRow(json[i], i);
          if (error) {
            throw new Error(error);
          }
        }

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

          // Get image path, using product code as fallback if image name is not provided
          const imageName = String(firstRow.Imagem || firstRow.Codigo);
          const imagePath = ImageProcessor.getImagePath(imageName);

          return {
            id: `group-${position}`,
            position: Number(position),
            title: firstRow.Descricao,
            image: imagePath,
            products: products,
            groupType: getGroupType(products),
          };
        });

        resolve(productGroups);
      } catch (error) {
        console.error('Erro ao processar Excel:', error);
        reject(new Error(error instanceof Error ? error.message : "Erro ao processar arquivo Excel. Verifique se o formato está correto."));
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
          const hasMinimumColumns = range.e.c >= 5; // Need 6 columns (0-indexed, so check for 5)
          
          resolve(hasMinimumColumns);
        } catch {
          resolve(false);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
}