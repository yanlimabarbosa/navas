package com.navas.navas.project.repository;

import com.navas.navas.project.model.FlyerConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FlyerConfigRepository extends JpaRepository<FlyerConfigEntity, UUID> {
}
