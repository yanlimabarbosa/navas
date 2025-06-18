package com.navas.navas.project.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "saved_projects")
public class SavedProjectEntity {

    @Id
    private UUID id;

    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "config_id")
    private FlyerConfigEntity config;

    @ManyToMany
    @JoinTable(name = "project_groups",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "group_id"))
    private List<ProductGroupEntity> groups = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "project_products",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<ProductEntity> products = new ArrayList<>();

    @CreationTimestamp
    private Instant createdAt;
    @UpdateTimestamp
    private Instant updatedAt;
}
