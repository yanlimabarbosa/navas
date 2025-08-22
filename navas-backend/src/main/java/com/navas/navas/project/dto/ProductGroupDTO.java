package com.navas.navas.project.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductGroupDTO {
    private String id;
    private String groupType;
    private String title;
    private String image;
    private int position;
    private Integer flyerPage;
    private List<ProductDTO> products;
} 