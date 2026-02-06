import * as XLSX from 'xlsx';
import { ProductGroup, Product, ExcelData, QUADRANTS_PER_FLYER } from '../types';

function getGroupType(products: Product[]): 'single' | 'same-price' | 'different-price' {
  if (products.length === 1) {
    return 'single';
  }
  const firstPrice = products[0].price;
  const allSamePrice = products.every((p) => p.price === firstPrice);
  return allSamePrice ? 'same-price' : 'different-price';
}

function normalizeImageName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function isPhantomRow(row: Partial<ExcelData>): boolean {
  const invisibleChar = '\u200B';

  const posicao = String(row.Posicao || '').trim();
  const codigo = String(row.Codigo || '').trim();
  const descricao = String(row.Descricao || '').trim();
  const preco = String(row.Preco || '').trim();

  const isInvisibleOrEmpty = (value: string) =>
    !value || value === invisibleChar || value.replace(/[\u200B\s]/g, '') === '';

  return (
    isInvisibleOrEmpty(posicao) &&
    isInvisibleOrEmpty(codigo) &&
    isInvisibleOrEmpty(descricao) &&
    isInvisibleOrEmpty(preco)
  );
}

function validateExcelRow(row: Partial<ExcelData>, rowIndex: number): string | null {
  if (!row.Posicao || typeof row.Posicao !== 'number') {
    return `Linha ${rowIndex + 2}: Posição inválida ou faltando`;
  }
  if (row.Posicao < 1) {
    return `Linha ${rowIndex + 2}: Posição deve ser maior que 0`;
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
  // Image column validation removed to allow auto-fetch from description
  return null;
}

function calculateFlyerPage(position: number): number {
  return Math.ceil(position / QUADRANTS_PER_FLYER);
}

function normalizePosition(position: number): number {
  return ((position - 1) % QUADRANTS_PER_FLYER) + 1;
}

export const processExcelFile = (file: File): Promise<ProductGroup[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reader.abort();
      reject(new Error('Erro ao ler o arquivo.'));
    };

    reader.onload = (event) => {
      const data = event.target?.result;
      if (!data) {
        return reject(new Error('Nenhum dado encontrado no arquivo.'));
      }

      try {
        // Parse Excel file
        const workbook = XLSX.read(data, { type: 'array' });
        if (!workbook.SheetNames.length) {
          throw new Error('Arquivo Excel não contém planilhas.');
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json<ExcelData>(worksheet);

        if (!rawJson.length) {
          throw new Error('Planilha está vazia ou não contém dados válidos.');
        }

        // Filter out phantom rows with invisible characters
        const json = rawJson.filter((row) => !isPhantomRow(row));

        if (!json.length) {
          throw new Error('Planilha não contém dados válidos após filtrar linhas vazias.');
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
          const positionNumber = Number(position);

          const products: Product[] = rows.map((row, index) => ({
            id: `prod-${position}-${index}`,
            code: String(row.Codigo),
            price: Number(String(row.Preco).replace(',', '.')), // Handle both dot and comma for decimals
            description: row.Descricao,
            specifications: row.Diferencial,
          }));

          // Get image path: prefer 'Imagem' column, fallback to normalized 'Descricao', then 'Codigo'
          let imageName = String(firstRow.Imagem || '').trim();
          if (!imageName && firstRow.Descricao) {
            imageName = normalizeImageName(firstRow.Descricao);
          }
          if (!imageName) {
            imageName = String(firstRow.Codigo);
          }

          // Note: imagePath will be resolved asynchronously in the component

          return {
            id: `group-${position}`,
            position: normalizePosition(positionNumber),
            flyerPage: calculateFlyerPage(positionNumber),
            title: firstRow.Descricao,
            image: imageName, // Pass the image name instead of resolved path
            products: products,
            groupType: getGroupType(products),
          };
        });

        resolve(productGroups);
      } catch (error) {
        console.error('Erro ao processar Excel:', error);
        reject(
          new Error(
            error instanceof Error
              ? error.message
              : 'Erro ao processar arquivo Excel. Verifique se o formato está correto.'
          )
        );
      }
    };

    reader.readAsArrayBuffer(file);
  });
};

