package com.navas.navas.project.dto;

import com.navas.navas.project.dto.FlyerConfigDTO;
import com.navas.navas.project.dto.ProductDTO;
import com.navas.navas.project.dto.ProductGroupDTO;
import lombok.Data;

import java.util.List;

@Data
public class SavedProjectRequestDTO {
    private String name;
    private FlyerConfigDTO config;
    private List<ProductGroupDTO> groups;
    private List<ProductDTO> products;
}