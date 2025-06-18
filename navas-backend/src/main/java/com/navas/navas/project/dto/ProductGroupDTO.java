package com.navas.navas.project.dto;

import com.navas.navas.project.model.ProductGroupType;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class ProductGroupDTO {
    private UUID id;
    private ProductGroupType type;
    private String title;
    private List<ProductDTO> products;
    private int position;
}
