package com.navas.navas.project.dto;

import com.navas.navas.project.model.FlyerProject;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class FlyerProjectResponseDTO {
    private UUID id;
    private String name;
    private FlyerConfigDTO config;
    private List<ProductGroupDTO> groups;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FlyerProjectResponseDTO fromEntity(FlyerProject project) {
        FlyerProjectResponseDTO dto = new FlyerProjectResponseDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setUpdatedAt(project.getUpdatedAt());

        FlyerConfigDTO configDTO = new FlyerConfigDTO();
        configDTO.setTitle(project.getConfig().getTitle());
        configDTO.setHeaderText(project.getConfig().getHeaderText());
        configDTO.setFooterText(project.getConfig().getFooterText());
        configDTO.setHeaderImageUrl(project.getConfig().getHeaderImageUrl());
        configDTO.setFooterImageUrl(project.getConfig().getFooterImageUrl());
        configDTO.setBackgroundColor(project.getConfig().getBackgroundColor());
        configDTO.setPrimaryColor(project.getConfig().getPrimaryColor());
        configDTO.setSecondaryColor(project.getConfig().getSecondaryColor());
        dto.setConfig(configDTO);

        dto.setGroups(project.getProductGroups().stream().map(group -> {
            ProductGroupDTO groupDTO = new ProductGroupDTO();
            groupDTO.setId(group.getId().toString());
            groupDTO.setType(group.getType());
            groupDTO.setTitle(group.getTitle());
            groupDTO.setImage(group.getImage());
            groupDTO.setPosition(group.getPosition());
            
            groupDTO.setProducts(group.getProducts().stream().map(product -> {
                ProductDTO productDTO = new ProductDTO();
                productDTO.setId(product.getId().toString());
                productDTO.setCode(product.getCode());
                productDTO.setDescription(product.getDescription());
                productDTO.setSpecifications(product.getSpecifications());
                productDTO.setPrice(product.getPrice());
                return productDTO;
            }).collect(Collectors.toList()));
            return groupDTO;
        }).collect(Collectors.toList()));

        return dto;
    }
} 