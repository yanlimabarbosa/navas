package com.navas.navas.project.repository;

import com.navas.navas.project.model.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {
    java.util.Optional<ProductEntity> findByCode(String code);
}
