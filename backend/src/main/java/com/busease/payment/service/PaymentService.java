package com.busease.payment.service;

import com.busease.auth.entity.User;
import com.busease.auth.repository.UserRepository;
import com.busease.booking.entity.Booking;
import com.busease.booking.repository.BookingRepository;
import com.busease.booking.service.BookingService;
import com.busease.exception.ResourceNotFoundException;
import com.busease.payment.dto.PaymentRequest;
import com.busease.payment.entity.Payment;
import com.busease.payment.entity.PaymentStatus;
import com.busease.payment.repository.PaymentRepository;
import com.busease.redis.RedisService;
import com.busease.schedule.entity.Schedule;
import com.busease.schedule.repository.ScheduleRepository;
import com.busease.security.SecurityUtils;
import com.busease.websocket.SeatStatus;
import com.busease.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;
    private final RedisService redisService;
    private final WebSocketService webSocketService;

    // CREATE PAYMENT (PENDING STATUS)
    @Transactional
    public Payment createPayment(PaymentRequest request) {

        Long userId = request.getUserId();
        if (userId == null) {
            Optional<String> currentUserEmail = SecurityUtils.getCurrentUserEmail();
            if (currentUserEmail.isPresent()) {
                User user = userRepository.findByEmail(currentUserEmail.get()).orElse(null);
                if (user != null) {
                    userId = user.getId();
                }
            }
        }

        if (userId == null) {
            throw new IllegalArgumentException("User ID must be provided via authentication or request body");
        }

        Long scheduleId = request.getScheduleId();
        List<Integer> effectiveSeatNumbers = request.getEffectiveSeatNumbers();

        if (effectiveSeatNumbers == null || effectiveSeatNumbers.isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected for payment creation");
        }

        if (effectiveSeatNumbers.size() > 6) {
            throw new IllegalArgumentException("Cannot create payment for more than 6 seats");
        }

        // 1. Fetch user & schedule first
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));

        // 2. Check if any requested seat is already booked in database
        if (bookingRepository.areAnySeatsBooked(scheduleId, effectiveSeatNumbers)) {
            throw new IllegalStateException("One or more selected seats are already booked in system!");
        }

        // 3. Validate Redis seat locks for ALL seats
        for (Integer seat : effectiveSeatNumbers) {
            String key = redisService.getSeatLockKey(scheduleId, seat);
            String lockedUser = redisService.getValue(key);

            if (lockedUser == null) {
                throw new IllegalStateException("Seat " + seat + " is not locked or lock expired");
            }

            if (!lockedUser.equals(userId.toString())) {
                throw new IllegalStateException("Seat " + seat + " locked by another user");
            }
        }

        // 4. Derive amount securely from Schedule entity (DO NOT TRUST FRONTEND AMOUNT)
        Double unitPrice = schedule.getPrice() != null ? schedule.getPrice() : 0.0;
        Double totalAmount = unitPrice * effectiveSeatNumbers.size();

        // 5. Create payment record (PENDING)
        Payment payment = Payment.builder()
                .user(user)
                .schedule(schedule)
                .seatNumber(effectiveSeatNumbers.get(0))
                .seatNumbers(effectiveSeatNumbers)
                .amount(totalAmount)
                .status(PaymentStatus.PENDING)
                .paymentTime(LocalDateTime.now())
                .build();

        return paymentRepository.save(payment);
    }

    // PROCESS PAYMENT (SUCCESS or FAILED)
    @Transactional
    public Payment processPayment(Long paymentId, boolean success) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        // Idempotency check: if payment was already processed
        if (payment.getStatus() == PaymentStatus.SUCCESS || payment.getStatus() == PaymentStatus.FAILED) {
            log.info("Payment {} already in terminal state {}", paymentId, payment.getStatus());
            return payment;
        }

        List<Integer> seatNumbers = payment.getEffectiveSeatNumbers();
        Long scheduleId = payment.getSchedule().getId();

        if (success) {
            // Confirm booking in DB (creates CONFIRMED booking and removes Redis locks)
            bookingService.confirmBooking(
                    payment.getUser().getId(),
                    scheduleId,
                    seatNumbers
            );

            // Update payment status to SUCCESS
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaymentTime(LocalDateTime.now());
            log.info("Payment {} successfully processed and marked SUCCESS", paymentId);
        } else {
            // Mark payment FAILED
            payment.setStatus(PaymentStatus.FAILED);
            payment.setPaymentTime(LocalDateTime.now());

            // Release Redis locks for all seats
            redisService.unlockSeats(scheduleId, seatNumbers);

            // Broadcast WebSocket unlock events
            for (Integer seat : seatNumbers) {
                webSocketService.publishSeatEvent(scheduleId, seat, SeatStatus.UNLOCKED);
            }

            log.info("Payment {} failed. Released Redis locks for seats {}", paymentId, seatNumbers);
        }

        return paymentRepository.save(payment);
    }

    // MARK PAYMENT SUCCESS & CONFIRM BOOKING (Backward compatible helper)
    @Transactional
    public Booking markPaymentSuccess(Long paymentId) {
        Payment payment = processPayment(paymentId, true);
        List<Integer> seats = payment.getEffectiveSeatNumbers();
        return bookingRepository.findByScheduleIdAndSeatNumber(payment.getSchedule().getId(), seats.isEmpty() ? 0 : seats.get(0))
                .orElseGet(() -> bookingRepository.findByUserIdOrderByBookingTimeDesc(payment.getUser().getId())
                        .stream().findFirst().orElseThrow(() -> new IllegalStateException("Booking not found after payment success")));
    }
}

