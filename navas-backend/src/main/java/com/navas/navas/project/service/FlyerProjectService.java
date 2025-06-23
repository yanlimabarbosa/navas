package com.navas.navas.project.service;

import com.navas.navas.project.dto.SaveProjectRequest;
import com.navas.navas.project.dto.ProjectSummaryDTO;
import com.navas.navas.project.model.FlyerConfig;
import com.navas.navas.project.model.FlyerProject;
import com.navas.navas.project.model.Product;
import com.navas.navas.project.model.ProductGroup;
import com.navas.navas.project.repository.FlyerProjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlyerProjectService {

    private final FlyerProjectRepository flyerProjectRepository;

    @Transactional
    public FlyerProject saveProject(SaveProjectRequest request) {
        FlyerProject project = new FlyerProject();
        project.setName(request.getName());

        // Map Config
        FlyerConfig config = new FlyerConfig();
        config.setTitle(request.getConfig().getTitle());
        config.setHeaderText(request.getConfig().getHeaderText());
        config.setFooterText(request.getConfig().getFooterText());
        config.setHeaderImageUrl(request.getConfig().getHeaderImageUrl());
        config.setFooterImageUrl(request.getConfig().getFooterImageUrl());
        config.setBackgroundColor(request.getConfig().getBackgroundColor());
        config.setPrimaryColor(request.getConfig().getPrimaryColor());
        config.setSecondaryColor(request.getConfig().getSecondaryColor());
        project.setConfig(config);
        config.setFlyerProject(project);

        // Map Product Groups and Products
        List<ProductGroup> productGroups = request.getGroups().stream().map(groupDTO -> {
            ProductGroup group = new ProductGroup();
            group.setPosition(groupDTO.getPosition());
            group.setType(groupDTO.getType());
            group.setTitle(groupDTO.getTitle());
            // Remember our logic: the image path is derived from the first product's code
            group.setImage(String.format("imagens_produtos/%s.png", groupDTO.getProducts().get(0).getCode()));
            
            List<Product> products = groupDTO.getProducts().stream().map(productDTO -> {
                Product product = new Product();
                product.setCode(productDTO.getCode());
                product.setDescription(productDTO.getDescription());
                product.setSpecifications(productDTO.getSpecifications());
                product.setPrice(productDTO.getPrice());
                return product;
            }).collect(Collectors.toList());
            
            group.setProducts(products);
            group.setFlyerProject(project);
            
            return group;
        }).collect(Collectors.toList());
        
        project.setProductGroups(productGroups);
        
        return flyerProjectRepository.save(project);
    }

    public List<ProjectSummaryDTO> getAllProjects() {
        return flyerProjectRepository.findAllOrderByUpdatedAtDesc().stream()
                .map(project -> new ProjectSummaryDTO(project.getId(), project.getName(), project.getUpdatedAt()))
                .collect(Collectors.toList());
    }

    public Optional<FlyerProject> getProjectById(UUID id) {
        return flyerProjectRepository.findById(id);
    }

    @Transactional
    public Optional<FlyerProject> updateProject(UUID id, SaveProjectRequest request) {
        return flyerProjectRepository.findById(id).map(existingProject -> {
            // Update basic project info
            existingProject.setName(request.getName());
            
            // Update config
            FlyerConfig config = existingProject.getConfig();
            if (config == null) {
                config = new FlyerConfig();
                config.setFlyerProject(existingProject);
                existingProject.setConfig(config);
            }
            
            config.setTitle(request.getConfig().getTitle());
            config.setHeaderText(request.getConfig().getHeaderText());
            config.setFooterText(request.getConfig().getFooterText());
            config.setHeaderImageUrl(request.getConfig().getHeaderImageUrl());
            config.setFooterImageUrl(request.getConfig().getFooterImageUrl());
            config.setBackgroundColor(request.getConfig().getBackgroundColor());
            config.setPrimaryColor(request.getConfig().getPrimaryColor());
            config.setSecondaryColor(request.getConfig().getSecondaryColor());
            
            // Create new product groups
            List<ProductGroup> newProductGroups = request.getGroups().stream().map(groupDTO -> {
                ProductGroup group = new ProductGroup();
                group.setPosition(groupDTO.getPosition());
                group.setType(groupDTO.getType());
                group.setTitle(groupDTO.getTitle());
                // Remember our logic: the image path is derived from the first product's code
                group.setImage(String.format("imagens_produtos/%s.png", groupDTO.getProducts().get(0).getCode()));
                
                List<Product> products = groupDTO.getProducts().stream().map(productDTO -> {
                    Product product = new Product();
                    product.setCode(productDTO.getCode());
                    product.setDescription(productDTO.getDescription());
                    product.setSpecifications(productDTO.getSpecifications());
                    product.setPrice(productDTO.getPrice());
                    return product;
                }).collect(Collectors.toList());
                
                group.setProducts(products);
                group.setFlyerProject(existingProject);
                
                return group;
            }).collect(Collectors.toList());
            
            // Use the helper method to properly set product groups
            existingProject.setProductGroups(newProductGroups);
            
            return flyerProjectRepository.save(existingProject);
        });
    }

    @Transactional
    public boolean deleteProject(UUID id) {
        return flyerProjectRepository.findById(id).map(project -> {
            flyerProjectRepository.delete(project);
            return true;
        }).orElse(false);
    }
} 