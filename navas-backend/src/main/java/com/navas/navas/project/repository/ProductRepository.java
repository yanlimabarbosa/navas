package com.navas.navas.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.navas.navas.project.model.Product;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByCode(String code);
}
