package com.navas.navas.project.model;

import com.navas.navas.project.dto.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

public final class ModelMapper {

    private ModelMapper() {
        // utility class
    }

    // --- DTO to Entity ------------------------------------------------------

    public static ProductEntity toEntity(ProductDTO dto) {
        ProductEntity e = new ProductEntity();
        e.setId(dto.getId());
        e.setCode(dto.getCode());
        e.setDescription(dto.getDescription());
        e.setPrice(dto.getPrice() != null ? dto.getPrice() : BigDecimal.ZERO);
        e.setCategory(dto.getCategory());
        e.setSpecifications(dto.getSpecifications());
        return e;
    }

    public static FlyerConfigEntity toEntity(FlyerConfigDTO dto) {
        FlyerConfigEntity e = new FlyerConfigEntity();
        e.setId(dto.getId());
        e.setTitle(dto.getTitle());
        e.setHeaderText(dto.getHeaderText());
        e.setFooterText(dto.getFooterText());
        e.setHeaderImageUrl(dto.getHeaderImageUrl());
        e.setFooterImageUrl(dto.getFooterImageUrl());
        e.setBackgroundColor(dto.getBackgroundColor());
        e.setPrimaryColor(dto.getPrimaryColor());
        e.setSecondaryColor(dto.getSecondaryColor());
        return e;
    }

    public static ProductGroupEntity toEntity(ProductGroupDTO dto, Map<UUID, ProductEntity> products) {
        ProductGroupEntity g = new ProductGroupEntity();
        g.setId(dto.getId());
        g.setType(dto.getType());
        g.setTitle(dto.getTitle());
        g.setPosition(dto.getPosition());
        if (dto.getProducts() != null) {
            List<ProductEntity> list = dto.getProducts().stream()
                    .map(p -> products.getOrDefault(p.getId(), toEntity(p)))
                    .collect(Collectors.toList());
            g.setProducts(list);
        }
        return g;
    }

    public static SavedProjectEntity toEntity(SavedProjectRequestDTO dto) {
        SavedProjectEntity p = new SavedProjectEntity();
        p.setName(dto.getName());
        return p;
    }

    // --- Entity to DTO ------------------------------------------------------

    public static ProductDTO toDto(ProductEntity e) {
        ProductDTO d = new ProductDTO();
        d.setId(e.getId());
        d.setCode(e.getCode());
        d.setDescription(e.getDescription());
        d.setPrice(e.getPrice());
        d.setCategory(e.getCategory());
        d.setSpecifications(e.getSpecifications());
        return d;
    }

    public static FlyerConfigDTO toDto(FlyerConfigEntity e) {
        FlyerConfigDTO d = new FlyerConfigDTO();
        d.setId(e.getId());
        d.setTitle(e.getTitle());
        d.setHeaderText(e.getHeaderText());
        d.setFooterText(e.getFooterText());
        d.setHeaderImageUrl(e.getHeaderImageUrl());
        d.setFooterImageUrl(e.getFooterImageUrl());
        d.setBackgroundColor(e.getBackgroundColor());
        d.setPrimaryColor(e.getPrimaryColor());
        d.setSecondaryColor(e.getSecondaryColor());
        d.setCreatedAt(e.getCreatedAt());
        d.setUpdatedAt(e.getUpdatedAt());
        return d;
    }

    public static ProductGroupDTO toDto(ProductGroupEntity e) {
        ProductGroupDTO d = new ProductGroupDTO();
        d.setId(e.getId());
        d.setType(e.getType());
        d.setTitle(e.getTitle());
        d.setPosition(e.getPosition());
        d.setProducts(e.getProducts().stream().map(ModelMapper::toDto).toList());
        return d;
    }

    public static SavedProjectResponseDTO toResponseDto(SavedProjectEntity e) {
        SavedProjectResponseDTO d = new SavedProjectResponseDTO();
        d.setId(e.getId());
        d.setName(e.getName());
        d.setConfig(toDto(e.getConfig()));
        d.setGroups(e.getGroups().stream().map(ModelMapper::toDto).toList());
        d.setProducts(e.getProducts().stream().map(ModelMapper::toDto).toList());
        d.setCreatedAt(e.getCreatedAt());
        d.setUpdatedAt(e.getUpdatedAt());
        return d;
    }
}
