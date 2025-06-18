package com.navas.navas.project.service;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.navas.navas.project.model.Product;
import com.navas.navas.project.repository.ProductRepository;

import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Optional;

@Service
public class ProductService {

        private final ProductRepository productRepository;

        public ProductService(ProductRepository productRepository) {
                this.productRepository = productRepository;
        }

        @Transactional
        public void importProductsFromExcel(MultipartFile file) throws Exception {
                try (InputStream is = file.getInputStream()) {
                        Workbook workbook = WorkbookFactory.create(is);
                        Sheet sheet = workbook.getSheetAt(0);

                        Iterator<Row> rows = sheet.iterator();

                        while (rows.hasNext()) {
                                Row currentRow = rows.next();

                                // Ignorar linha do cabeçalho (opcional)
                                if (currentRow.getRowNum() == 0) {
                                        continue;
                                }

                                Cell codeCell = currentRow.getCell(0);
                                Cell titleCell = currentRow.getCell(1);
                                Cell priceCell = currentRow.getCell(2);

                                if (codeCell == null || titleCell == null || priceCell == null) {
                                        continue; // pula linhas incompletas
                                }

                                String code = "";
                                if (codeCell.getCellType() == CellType.STRING) {
                                        code = codeCell.getStringCellValue().trim();
                                } else if (codeCell.getCellType() == CellType.NUMERIC) {
                                        code = String.valueOf((long) codeCell.getNumericCellValue());
                                }
                                String title = titleCell.getStringCellValue().trim();
                                double price = priceCell.getNumericCellValue();

                                // Verifica se produto já existe
                                Optional<Product> existingProduct = productRepository.findByCode(code);
                                if (existingProduct.isPresent()) {
                                        Product prod = existingProduct.get();
                                        prod.setTitle(title);
                                        prod.setPrice(price);
                                        productRepository.save(prod);
                                } else {
                                        Product prod = new Product();
                                        prod.setCode(code);
                                        prod.setTitle(title);
                                        prod.setPrice(price);
                                        productRepository.save(prod);
                                }
                        }
                        workbook.close();
                }
        }
}
