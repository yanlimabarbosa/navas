import * as XLSX from 'xlsx';
import { Product, ExcelData } from '../types';

export class ExcelProcessor {
  static async processFile(file: File): Promise<Product[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData: ExcelData[] = XLSX.utils.sheet_to_json(worksheet, {
        header: ['code', 'produto', 'preco'],
        range: 1 // Skip header row
      });

      return jsonData
        .filter(row => row.code && row.produto && row.preco)
        .map((row, index) => ({
          id: `product-${index}`,
          code: String(row.code).trim(),
          description: String(row.produto).trim(),
          price: Number(row.preco) || 0,
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