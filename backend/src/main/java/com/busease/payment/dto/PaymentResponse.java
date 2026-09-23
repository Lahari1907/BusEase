package com.busease.payment.dto;

import com.busease.payment.entity.Payment;
import com.busease.payment.entity.PaymentStatus;
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
public class PaymentResponse {

    private Long id;
    private Long userId;
    private Long scheduleId;
    private Integer seatNumber;
    private List<Integer> seatNumbers;
    private Double amount;
    private PaymentStatus status;
    private LocalDateTime paymentTime;

    public static PaymentResponse fromEntity(Payment payment) {
        if (payment == null) return null;
        List<Integer> effectiveSeats = payment.getEffectiveSeatNumbers();
        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUser() != null ? payment.getUser().getId() : null)
                .scheduleId(payment.getSchedule() != null ? payment.getSchedule().getId() : null)
                .seatNumber(payment.getSeatNumber())
                .seatNumbers(effectiveSeats)
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paymentTime(payment.getPaymentTime())
                .build();
    }
}
