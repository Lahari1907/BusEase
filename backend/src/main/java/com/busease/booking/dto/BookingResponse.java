package com.busease.booking.dto;

import com.busease.booking.entity.Booking;
import com.busease.booking.entity.BookingStatus;
import com.busease.schedule.entity.Schedule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;
    private Long userId;
    private String userName;
    private Long scheduleId;
    private int seatNumber;
    private List<Integer> seatNumbers;
    private Integer seatsBooked;
    private Double totalAmount;
    private BookingStatus status;
    private LocalDateTime bookingTime;
    private Schedule schedule;

    public static BookingResponse fromEntity(Booking booking) {
        if (booking == null) return null;
        List<Integer> effectiveSeats = booking.getEffectiveSeatNumbers();
        return BookingResponse.builder()
                .id(booking.getId())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userName(booking.getUser() != null ? booking.getUser().getName() : null)
                .scheduleId(booking.getSchedule() != null ? booking.getSchedule().getId() : null)
                .seatNumber(booking.getSeatNumber())
                .seatNumbers(effectiveSeats)
                .seatsBooked(booking.getSeatsBooked())
                .totalAmount(booking.getTotalAmount())
                .status(booking.getStatus())
                .bookingTime(booking.getBookingTime())
                .schedule(booking.getSchedule())
                .build();
    }
}
