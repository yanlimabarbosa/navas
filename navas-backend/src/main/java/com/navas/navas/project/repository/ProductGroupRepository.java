package com.navas.navas.project.repository;

import com.navas.navas.project.model.ProductGroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProductGroupRepository extends JpaRepository<ProductGroupEntity, UUID> {
}
