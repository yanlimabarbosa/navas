package com.navas.navas.project.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "product_groups")
public class ProductGroupEntity {

    @Id
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductGroupType type;

    private String title;

    @Column(nullable = false)
    private int position;

    @ManyToMany
    @JoinTable(name = "product_group_members", joinColumns = @JoinColumn(name = "group_id"), inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<ProductEntity> products = new ArrayList<>();
}
