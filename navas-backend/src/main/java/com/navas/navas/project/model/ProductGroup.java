package com.navas.navas.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "product_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "group_type", nullable = false)
    private String type; // e.g., "single", "same-price", "different-price"

    @Column(columnDefinition = "TEXT")
    private String title;

    private String image;

    @Column(nullable = false)
    private int position;

    @OneToMany(mappedBy = "productGroup", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Product> products = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flyer_project_id")
    private FlyerProject flyerProject;

    // Helper method to sync both sides of the relationship
    public void setProducts(List<Product> products) {
        this.products.clear();
        if (products != null) {
            this.products.addAll(products);
            products.forEach(product -> product.setProductGroup(this));
        }
    }
} 