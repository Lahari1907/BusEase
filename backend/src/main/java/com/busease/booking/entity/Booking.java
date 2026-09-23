package com.busease.booking.entity;

import com.busease.auth.entity.User;
import com.busease.schedule.entity.Schedule;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Passenger
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Schedule
    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private Schedule schedule;

    private Integer seatsBooked;

    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    private LocalDateTime bookingTime;

    @Column(name = "seat_number", nullable = true)
    private Integer seatNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "booking_seats", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "seat_number")
    @Builder.Default
    private java.util.List<Integer> seatNumbers = new java.util.ArrayList<>();

    public java.util.List<Integer> getEffectiveSeatNumbers() {
        if (seatNumbers != null && !seatNumbers.isEmpty()) {
            return seatNumbers;
        }
        if (seatNumber != null) {
            return java.util.List.of(seatNumber);
        }
        return java.util.List.of();
    }

    public int getSeatNumber() {
        if (seatNumber != null && seatNumber != 0) {
            return seatNumber;
        }
        java.util.List<Integer> effective = getEffectiveSeatNumbers();
        return effective.isEmpty() ? 0 : effective.get(0);
    }

    @PrePersist
    public void prePersist() {
        if (bookingTime == null) {
            bookingTime = LocalDateTime.now();
        }

        if (status == null) {
            status = BookingStatus.PENDING;
        }
    }
}
