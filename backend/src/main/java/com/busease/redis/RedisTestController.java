package com.busease.redis;

import com.busease.auth.entity.User;
import com.busease.auth.repository.UserRepository;
import com.busease.booking.repository.BookingRepository;
import com.busease.security.SecurityUtils;
import com.busease.websocket.SeatStatus;
import com.busease.websocket.WebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class RedisTestController {

    private final RedisService redisService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WebSocketService webSocketService;

    @PostMapping("/set")
    public ResponseEntity<String> setValue(@RequestParam String key, @RequestParam String value) {
        redisService.setValue(key, value);
        return ResponseEntity.ok("Saved!");
    }

    @GetMapping("/get")
    public ResponseEntity<Object> getValue(@RequestParam String key) {
        return ResponseEntity.ok(redisService.getValue(key));
    }

    @PostMapping("/lock")
    public ResponseEntity<Map<String, Object>> lockSeat(
            @RequestParam Long scheduleId,
            @RequestParam(required = false) Integer seatNumber,
            @RequestParam(required = false) java.util.List<Integer> seatNumbers,
            @RequestParam(required = false) Long userId
    ) {
        java.util.List<Integer> seatsToLock = (seatNumbers != null && !seatNumbers.isEmpty())
                ? seatNumbers
                : (seatNumber != null ? java.util.List.of(seatNumber) : java.util.List.of());

        if (seatsToLock.isEmpty()) {
            throw new IllegalArgumentException("Seat number(s) must be provided");
        }

        if (seatsToLock.size() > 6) {
            throw new IllegalArgumentException("Cannot lock more than 6 seats at once");
        }

        // Resolve target user ID from JWT if available, else fall back to request parameter
        Long targetUserId = userId;
        Optional<String> currentUserEmail = SecurityUtils.getCurrentUserEmail();
        if (currentUserEmail.isPresent()) {
            User user = userRepository.findByEmail(currentUserEmail.get()).orElse(null);
            if (user != null) {
                targetUserId = user.getId();
            }
        }

        if (targetUserId == null) {
            throw new IllegalArgumentException("User ID must be provided via authentication or request parameter");
        }

        log.info("Request to lock seats {} for schedule {} by user {}", seatsToLock, scheduleId, targetUserId);

        // 1. Check database for existing bookings across all requested seats
        if (bookingRepository.areAnySeatsBooked(scheduleId, seatsToLock)) {
            log.warn("Failed lock attempt: One or more seats in {} already booked for schedule {}", seatsToLock, scheduleId);
            throw new IllegalStateException("One or more selected seats are already booked!");
        }

        // 2. Check Redis lock for all seats
        for (Integer s : seatsToLock) {
            String key = redisService.getSeatLockKey(scheduleId, s);
            String existing = redisService.getValue(key);
            if (existing != null && !existing.equals(targetUserId.toString())) {
                log.warn("Failed lock attempt: Seat {} for schedule {} already locked by user {}", s, scheduleId, existing);
                throw new IllegalStateException("Seat " + s + " already locked by another user");
            }
        }

        // 3. Lock all seats for 5 minutes (300 seconds)
        for (Integer s : seatsToLock) {
            String key = redisService.getSeatLockKey(scheduleId, s);
            redisService.setValueWithExpiry(key, targetUserId.toString(), 300);
            webSocketService.publishSeatEvent(scheduleId, s, SeatStatus.LOCKED);
        }

        log.info("Successfully locked seats {} for schedule {} by user {}", seatsToLock, scheduleId, targetUserId);

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Seats locked successfully for 5 minutes",
                "seatNumbers", seatsToLock,
                "userId", targetUserId.toString()
        ));
    }

    @DeleteMapping("/unlock")
    public ResponseEntity<String> unlockSeat(
            @RequestParam Long scheduleId,
            @RequestParam(required = false) Integer seatNumber,
            @RequestParam(required = false) java.util.List<Integer> seatNumbers
    ) {
        java.util.List<Integer> seatsToUnlock = (seatNumbers != null && !seatNumbers.isEmpty())
                ? seatNumbers
                : (seatNumber != null ? java.util.List.of(seatNumber) : java.util.List.of());

        log.info("Unlocking seats {} for schedule {}", seatsToUnlock, scheduleId);

        for (Integer s : seatsToUnlock) {
            String key = redisService.getSeatLockKey(scheduleId, s);
            redisService.deleteKey(key);
            webSocketService.publishSeatEvent(scheduleId, s, SeatStatus.UNLOCKED);
        }

        return ResponseEntity.ok("Seats unlocked!");
    }
}

