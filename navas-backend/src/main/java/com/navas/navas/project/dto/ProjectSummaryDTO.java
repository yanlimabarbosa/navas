package com.navas.navas.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryDTO {
    private UUID id;
    private String name;
    private LocalDateTime updatedAt;
} 