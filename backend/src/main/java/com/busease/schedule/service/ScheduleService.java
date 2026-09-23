package com.busease.schedule.service;

import com.busease.bus.entity.Bus;
import com.busease.bus.repository.BusRepository;
import com.busease.exception.ResourceNotFoundException;
import com.busease.route.entity.Route;
import com.busease.route.repository.RouteRepository;
import com.busease.schedule.dto.SearchRequest;
import com.busease.schedule.entity.Schedule;
import com.busease.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class ScheduleService {


    private final ScheduleRepository scheduleRepository;

    private final BusRepository busRepository;

    private final RouteRepository routeRepository;



    public Schedule createSchedule(Schedule scheduleRequest) {


        Long busId = scheduleRequest.getBus().getId();

        Long routeId = scheduleRequest.getRoute().getId();



        Bus bus = busRepository.findById(busId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Bus not found with id: " + busId
                        )
                );


        Route route = routeRepository.findById(routeId)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Route not found with id: " + routeId
                        )
                );


        scheduleRequest.setBus(bus);

        scheduleRequest.setRoute(route);


        return scheduleRepository.save(scheduleRequest);
    }



    public List<Schedule> searchBuses(SearchRequest request){


        return scheduleRepository
                .findByRoute_SourceIgnoreCaseAndRoute_DestinationIgnoreCaseAndTravelDate(
                        request.getSource(),
                        request.getDestination(),
                        request.getDate()
                );
    }

}