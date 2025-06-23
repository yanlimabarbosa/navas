package com.navas.navas.project.repository;

import com.navas.navas.project.model.FlyerProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FlyerProjectRepository extends JpaRepository<FlyerProject, UUID> {
} 