package com.navas.navas.project.repository;

import com.navas.navas.project.model.SavedProjectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SavedProjectRepository extends JpaRepository<SavedProjectEntity, UUID> {
}
