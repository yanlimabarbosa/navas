package com.navas.navas.project.controller;

import com.navas.navas.project.dto.SavedProjectRequestDTO;
import com.navas.navas.project.dto.SavedProjectResponseDTO;

import com.navas.navas.project.service.ProjectService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService service;

    @PostMapping
    public SavedProjectResponseDTO create(@RequestBody SavedProjectRequestDTO dto) {
        return service.save(dto);
    }

    @GetMapping
    public java.util.List<SavedProjectResponseDTO> list() {
        return service.findAll();
    }
}
