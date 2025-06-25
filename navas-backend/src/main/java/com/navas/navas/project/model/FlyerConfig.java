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

    @Column(length = 500)
    private String title;
    
    @Column(length = 1000)
    private String headerText;
    
    @Column(length = 1000)
    private String footerText;
    
    @Column(columnDefinition = "TEXT")
    private String headerImageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String footerImageUrl;
    
    @Column(length = 50)
    private String backgroundColor;
    
    @Column(length = 50)
    private String primaryColor;
    
    @Column(length = 50)
    private String secondaryColor;

    @OneToOne(mappedBy = "config")
    private FlyerProject flyerProject;
} 