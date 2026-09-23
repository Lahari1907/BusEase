package com.busease.bus.service;

import com.busease.bus.entity.Bus;
import com.busease.bus.repository.BusRepository;
import com.busease.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BusService {

    private final BusRepository busRepository;

    public Bus createBus(Bus bus){
        return busRepository.save(bus);
    }

    public Bus updateBus(Long id, Bus updatedBus){

        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bus not found"));

        bus.setBusNumber(updatedBus.getBusNumber());
        bus.setBusName(updatedBus.getBusName());
        bus.setBusType(updatedBus.getBusType());
        bus.setTotalSeats(updatedBus.getTotalSeats());

        return busRepository.save(bus);
    }

    public void deleteBus(Long id){
        if(!busRepository.existsById(id)){
            throw new RuntimeException("Bus not found");
        }
        busRepository.deleteById(id);
    }
    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found with id: " + id));
    }


    public List<Bus> getAllBuses(){
        return busRepository.findAll();
    }
}