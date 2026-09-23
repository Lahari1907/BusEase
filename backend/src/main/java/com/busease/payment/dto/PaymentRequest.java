package com.busease.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {

    private Long userId;

    @NotNull(message = "Schedule ID is required")
    private Long scheduleId;

    @Min(value = 1, message = "Seat number must be at least 1")
    private Integer seatNumber;

    private List<Integer> seatNumbers;

    // Optional amount sent by frontend - backend will ignore it and calculate price securely from Schedule entity
    private Double amount;

    public List<Integer> getEffectiveSeatNumbers() {
        if (seatNumbers != null && !seatNumbers.isEmpty()) {
            return seatNumbers;
        }
        if (seatNumber != null) {
            return List.of(seatNumber);
        }
        return List.of();
    }
}
