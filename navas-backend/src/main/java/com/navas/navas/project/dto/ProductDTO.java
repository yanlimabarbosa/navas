package com.navas.navas.project.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ProductDTO {
    private UUID id;
    private String code;
    private String description;
    private BigDecimal price;
    private String category;
    private String specifications;
}
