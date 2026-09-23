package com.busease.bus.controller;

import com.busease.bus.entity.Bus;
import com.busease.bus.service.BusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BusController {

    private final BusService busService;

    // ✅ ADMIN: Create Bus
    @PostMapping("/admin/buses")
    public Bus createBus(@RequestBody Bus bus){
        return busService.createBus(bus);
    }

    // ✅ PUBLIC: Get All Buses
    @GetMapping("/buses")
    public List<Bus> getAllBuses() {
        return busService.getAllBuses();
    }

    // ✅ ADMIN: Update Bus
    @PutMapping("/admin/buses/{id}")
    public Bus updateBus(@PathVariable Long id, @RequestBody Bus bus){
        return busService.updateBus(id, bus);
    }

    // ✅ ADMIN: Delete Bus
    @DeleteMapping("/admin/buses/{id}")
    public String deleteBus(@PathVariable Long id){
        busService.deleteBus(id);
        return "Bus deleted successfully";
    }
}