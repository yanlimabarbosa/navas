package com.navas.navas.project.service;

import com.navas.navas.project.dto.SavedProjectRequestDTO;
import com.navas.navas.project.dto.SavedProjectResponseDTO;
import com.navas.navas.project.dto.ProductDTO;
import com.navas.navas.project.model.*;
import com.navas.navas.project.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final SavedProjectRepository projectRepository;
    private final ProductRepository productRepository;
    private final ProductGroupRepository groupRepository;
    private final FlyerConfigRepository configRepository;

    @Transactional
    public SavedProjectResponseDTO save(SavedProjectRequestDTO dto) {
        Instant now = Instant.now();

        // Flyer Config
        FlyerConfigEntity cfg = ModelMapper.toEntity(dto.getConfig());
        cfg.setId(UUID.randomUUID());
        configRepository.save(cfg);

        // Helper to fetch existing or create new product by code
        java.util.function.Function<ProductDTO, ProductEntity> getOrCreateProduct = (
                ProductDTO pDto) -> productRepository.findByCode(pDto.getCode())
                        .orElseGet(() -> {
                            ProductEntity e = ModelMapper.toEntity(pDto);
                            e.setId(UUID.randomUUID());
                            return productRepository.save(e);
                        });

        // avoid duplicates: collect codes used inside groups
        java.util.Set<String> codesInGroups = dto.getGroups().stream()
                .flatMap(g -> g.getProducts().stream())
                .map(ProductDTO::getCode)
                .collect(java.util.stream.Collectors.toSet());

        // Stand-alone products (exclude those already referenced in groups)
        List<ProductEntity> standaloneProducts = dto.getProducts().stream()
                .filter(p -> !codesInGroups.contains(p.getCode()))
                .map(getOrCreateProduct)
                .toList();

        // productMap not needed anymore; removed

        // Groups
        List<ProductGroupEntity> groups = dto.getGroups().stream()
                .map(g -> {
                    List<ProductEntity> groupProducts = g.getProducts().stream()
                            .map(getOrCreateProduct)
                            .toList();

                    ProductGroupEntity group = ModelMapper.toEntity(g, new HashMap<>());
                    group.setId(UUID.randomUUID());
                    group.setProducts(groupProducts);
                    return groupRepository.save(group);
                })
                .toList();

        // Main Project
        SavedProjectEntity project = ModelMapper.toEntity(dto);
        project.setId(UUID.randomUUID());
        project.setCreatedAt(now);
        project.setUpdatedAt(now);
        project.setConfig(cfg);
        project.setGroups(groups);

        // Combine unique products
        java.util.Set<ProductEntity> productSet = new java.util.HashSet<>();
        productSet.addAll(standaloneProducts);
        groups.forEach(gr -> productSet.addAll(gr.getProducts()));
        List<ProductEntity> allProducts = new java.util.ArrayList<>(productSet);

        project.setProducts(allProducts);

        SavedProjectEntity persisted = projectRepository.save(project);
        return ModelMapper.toResponseDto(persisted);
    }

    public java.util.List<SavedProjectResponseDTO> findAll() {
        return projectRepository.findAll().stream()
                .map(ModelMapper::toResponseDto)
                .toList();
    }
}
