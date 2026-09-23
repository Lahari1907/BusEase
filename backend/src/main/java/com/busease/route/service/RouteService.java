package com.busease.route.service;
import org.springframework.http.ResponseEntity;
import com.busease.route.dto.RouteRequest;
import com.busease.route.entity.Route;
import com.busease.route.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;

    // Create Route (DTO → Entity)
    public Route createRoute(RouteRequest request) {

        Route route = Route.builder()
                .source(request.getSource())
                .destination(request.getDestination())
                .distance(request.getDistance())
                .build();

        return routeRepository.save(route);
    }

    // Get All Routes
    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }
    public Route updateRoute(Long id, RouteRequest request) {

        Route route = routeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Route not found with id: " + id)
                );

        route.setSource(request.getSource());
        route.setDestination(request.getDestination());
        route.setDistance(request.getDistance());

        return routeRepository.save(route);
    }
    public void deleteRoute(Long id) {

        Route route = routeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Route not found with id: " + id)
                );

        routeRepository.delete(route);
    }

}