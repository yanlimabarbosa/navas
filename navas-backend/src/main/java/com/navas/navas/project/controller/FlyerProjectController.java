package com.navas.navas.project.controller;

import com.navas.navas.project.dto.FlyerProjectResponseDTO;
import com.navas.navas.project.dto.PagedProjectsResponseDTO;
import com.navas.navas.project.dto.ProjectSummaryDTO;
import com.navas.navas.project.dto.SaveProjectRequest;
import com.navas.navas.project.model.FlyerProject;
import com.navas.navas.project.service.FlyerProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow all origins for simplicity, configure properly for production
public class FlyerProjectController {

    private final FlyerProjectService flyerProjectService;

    @PostMapping
    public ResponseEntity<FlyerProjectResponseDTO> saveProject(@RequestBody SaveProjectRequest request) {
        FlyerProject savedProject = flyerProjectService.saveProject(request);
        return ResponseEntity.ok(FlyerProjectResponseDTO.fromEntity(savedProject));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlyerProjectResponseDTO> updateProject(@PathVariable UUID id, @RequestBody SaveProjectRequest request) {
        return flyerProjectService.updateProject(id, request)
                .map(project -> ResponseEntity.ok(FlyerProjectResponseDTO.fromEntity(project)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<PagedProjectsResponseDTO> getProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return ResponseEntity.ok(flyerProjectService.getProjectsPaginated(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlyerProjectResponseDTO> getProjectById(@PathVariable UUID id) {
        return flyerProjectService.getProjectById(id)
                .map(project -> ResponseEntity.ok(FlyerProjectResponseDTO.fromEntity(project)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable UUID id) {
        if (flyerProjectService.deleteProject(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
} 