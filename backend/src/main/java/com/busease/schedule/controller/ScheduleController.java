package com.busease.schedule.controller;

import com.busease.schedule.entity.Schedule;

import com.busease.schedule.dto.SearchRequest;
import com.busease.schedule.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedules")
@RequiredArgsConstructor

public class ScheduleController {

    private final ScheduleService scheduleService;

    // ✅ CREATE SCHEDULE (missing earlier)
    @PostMapping
    public Schedule create(@RequestBody Schedule schedule) {
        return scheduleService.createSchedule(schedule);
    }

    // ✅ SEARCH
    @PostMapping("/search")
    public List<Schedule> search(@RequestBody SearchRequest request) {
        return scheduleService.searchBuses(request);
    }
}
