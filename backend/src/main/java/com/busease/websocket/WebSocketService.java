package com.busease.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishSeatEvent(Long scheduleId, Integer seatNumber, SeatStatus status) {
        SeatEvent event = SeatEvent.builder()
                .scheduleId(scheduleId)
                .seatNumber(seatNumber)
                .status(status)
                .build();

        log.info("Broadcasting WebSocket SeatEvent: {}", event);
        messagingTemplate.convertAndSend("/topic/seats", event);
        messagingTemplate.convertAndSend("/topic/seats/" + scheduleId, event);
    }
}
