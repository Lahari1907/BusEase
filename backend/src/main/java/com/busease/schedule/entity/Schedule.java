package com.busease.schedule.entity;

import com.busease.bus.entity.Bus;
import com.busease.route.entity.Route;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;


    @ManyToOne
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;


    private LocalDate travelDate;

    private LocalTime departureTime;

    private LocalTime arrivalTime;

    private Double price;
}