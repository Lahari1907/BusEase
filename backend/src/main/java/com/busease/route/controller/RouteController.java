package com.busease.route.controller;

import com.busease.route.dto.RouteRequest;
import com.busease.route.entity.Route;
import com.busease.route.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    // ✅ FIX: use RouteRequest instead of Route
    @PostMapping
    public ResponseEntity<Route> createRoute(@RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.createRoute(request));
    }

    @GetMapping
    public ResponseEntity<List<Route>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }
    @PutMapping("/{id}")
    public ResponseEntity<Route> updateRoute(
            @PathVariable Long id,
            @RequestBody RouteRequest request
    ){
        return ResponseEntity.ok(routeService.updateRoute(id, request));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteRoute(
            @PathVariable Long id
    ){
        routeService.deleteRoute(id);
        return ResponseEntity.ok("Route deleted successfully");
    }
}