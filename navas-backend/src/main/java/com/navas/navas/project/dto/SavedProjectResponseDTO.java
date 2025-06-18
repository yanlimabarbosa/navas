package com.navas.navas.project.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
public class SavedProjectResponseDTO {
    private UUID id;
    private String name;
    private FlyerConfigDTO config;
    private List<ProductGroupDTO> groups;
    private List<ProductDTO> products;
    private Instant createdAt;
    private Instant updatedAt;
}
