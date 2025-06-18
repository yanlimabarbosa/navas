package com.navas.navas.project.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class FlyerConfigDTO {
    private UUID id;
    private String title;
    private String headerText;
    private String footerText;
    private String headerImageUrl;
    private String footerImageUrl;
    private String backgroundColor;
    private String primaryColor;
    private String secondaryColor;
    private Instant createdAt;
    private Instant updatedAt;
}
