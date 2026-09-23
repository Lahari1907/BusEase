package com.busease.bus.repository;

import com.busease.bus.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusRepository
        extends JpaRepository<Bus, Long> {

}
