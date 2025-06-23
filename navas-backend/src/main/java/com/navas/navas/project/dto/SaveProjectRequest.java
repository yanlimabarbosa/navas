package com.navas.navas.project.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveProjectRequest {
    private String name;
    private FlyerConfigDTO config;
    private List<ProductGroupDTO> groups;
} 