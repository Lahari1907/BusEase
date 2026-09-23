package com.busease.schedule.repository;

import com.busease.schedule.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    List<Schedule> findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndTravelDate(
            String source,
            String destination,
            LocalDate travelDate
    );
}