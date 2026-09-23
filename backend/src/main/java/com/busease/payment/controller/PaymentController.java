package com.busease.payment.controller;

import com.busease.payment.dto.PaymentRequest;
import com.busease.payment.dto.PaymentResponse;
import com.busease.payment.entity.Payment;
import com.busease.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // CREATE PAYMENT (PENDING)
    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@Valid @RequestBody PaymentRequest request) {
        Payment payment = paymentService.createPayment(request);
        return ResponseEntity.ok(PaymentResponse.fromEntity(payment));
    }

    // PROCESS PAYMENT (Simulate success/failure)
    @PostMapping("/process/{paymentId}")
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Long paymentId,
            @RequestParam(required = false) Boolean success,
            @RequestParam(required = false) String status,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        boolean isSuccess = true;
        if (success != null) {
            isSuccess = success;
        } else if (status != null) {
            isSuccess = "SUCCESS".equalsIgnoreCase(status);
        } else if (body != null && body.containsKey("success")) {
            isSuccess = Boolean.TRUE.equals(body.get("success"));
        } else if (body != null && body.containsKey("status")) {
            isSuccess = "SUCCESS".equalsIgnoreCase(String.valueOf(body.get("status")));
        }

        Payment payment = paymentService.processPayment(paymentId, isSuccess);
        return ResponseEntity.ok(PaymentResponse.fromEntity(payment));
    }
}
