package com.navas.navas.project.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "flyer_configs")
public class FlyerConfigEntity {

    @Id
    private UUID id;

    private String title;

    @Column(name = "header_text")
    private String headerText;

    @Column(name = "footer_text")
    private String footerText;

    private String headerImageUrl;
    private String footerImageUrl;

    private String backgroundColor;
    private String primaryColor;
    private String secondaryColor;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}
