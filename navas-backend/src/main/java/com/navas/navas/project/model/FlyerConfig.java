package com.navas.navas.project.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "flyer_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlyerConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    private String title;
    private String headerText;
    private String footerText;
    private String headerImageUrl;
    private String footerImageUrl;
    private String backgroundColor;
    private String primaryColor;
    private String secondaryColor;

    @OneToOne(mappedBy = "config")
    private FlyerProject flyerProject;
} 