package com.busease.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatEvent {

    private Long scheduleId;
    private Integer seatNumber;
    private SeatStatus status;
}
