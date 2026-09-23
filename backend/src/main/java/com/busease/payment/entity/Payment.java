package com.busease.payment.entity;

import com.busease.auth.entity.User;
import com.busease.schedule.entity.Schedule;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Schedule schedule;

    private Integer seatNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "payment_seats", joinColumns = @JoinColumn(name = "payment_id"))
    @Column(name = "seat_number")
    @Builder.Default
    private java.util.List<Integer> seatNumbers = new java.util.ArrayList<>();

    private Double amount;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private LocalDateTime paymentTime;

    public java.util.List<Integer> getEffectiveSeatNumbers() {
        if (seatNumbers != null && !seatNumbers.isEmpty()) {
            return seatNumbers;
        }
        if (seatNumber != null) {
            return java.util.List.of(seatNumber);
        }
        return java.util.List.of();
    }

    public Integer getSeatNumber() {
        if (seatNumber != null && seatNumber != 0) {
            return seatNumber;
        }
        java.util.List<Integer> effective = getEffectiveSeatNumbers();
        return effective.isEmpty() ? null : effective.get(0);
    }
}