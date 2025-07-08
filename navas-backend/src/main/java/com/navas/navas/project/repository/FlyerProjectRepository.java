package com.navas.navas.project.repository;

import com.navas.navas.project.model.FlyerProject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlyerProjectRepository extends JpaRepository<FlyerProject, UUID> {
    
    @Query("SELECT f FROM FlyerProject f ORDER BY f.updatedAt DESC")
    List<FlyerProject> findAllOrderByUpdatedAtDesc();
    
    @Query("SELECT f FROM FlyerProject f ORDER BY f.updatedAt DESC")
    Page<FlyerProject> findAllOrderByUpdatedAtDesc(Pageable pageable);
} 