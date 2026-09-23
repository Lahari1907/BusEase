package com.busease.booking.service;

import com.busease.auth.entity.User;
import com.busease.auth.repository.UserRepository;
import com.busease.booking.entity.Booking;
import com.busease.booking.entity.BookingStatus;
import com.busease.booking.repository.BookingRepository;
import com.busease.exception.ResourceNotFoundException;
import com.busease.redis.RedisService;
import com.busease.schedule.entity.Schedule;
import com.busease.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final RedisService redisService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ScheduleRepository scheduleRepository;

    @Transactional
    public Booking confirmBooking(Long userId, Long scheduleId, int seatNumber) {
        return confirmBooking(userId, scheduleId, List.of(seatNumber));
    }

    @Transactional
    public Booking confirmBooking(Long userId, Long scheduleId, List<Integer> seatNumbers) {
        if (seatNumbers == null || seatNumbers.isEmpty()) {
            throw new IllegalArgumentException("At least one seat must be selected");
        }
        if (seatNumbers.size() > 6) {
            throw new IllegalArgumentException("Cannot book more than 6 seats in a single booking");
        }

        // 1. Prevent duplicate booking for any seat
        if (bookingRepository.areAnySeatsBooked(scheduleId, seatNumbers)) {
            throw new IllegalStateException("One or more selected seats are already booked!");
        }

        // 2. Validate Redis lock ownership for all seats
        for (Integer seatNumber : seatNumbers) {
            String key = redisService.getSeatLockKey(scheduleId, seatNumber);
            String lockedUser = redisService.getValue(key);
            if (lockedUser != null && !lockedUser.equals(userId.toString())) {
                throw new IllegalStateException("Seat " + seatNumber + " locked by another user");
            }
        }

        // 3. Fetch user and schedule
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + scheduleId));

        // 4. Create and populate Booking entity with dynamic price calculation
        Double unitPrice = schedule.getPrice() != null ? schedule.getPrice() : 0.0;
        Double totalAmount = unitPrice * seatNumbers.size();

        Booking booking = Booking.builder()
                .user(user)
                .schedule(schedule)
                .seatNumber(seatNumbers.get(0))
                .seatNumbers(seatNumbers)
                .seatsBooked(seatNumbers.size())
                .totalAmount(totalAmount)
                .status(BookingStatus.CONFIRMED)
                .build();

        Booking saved = bookingRepository.save(booking);

        // 5. Remove Redis locks upon successful booking confirmation
        redisService.unlockSeats(scheduleId, seatNumbers);

        return saved;
    }

    @Transactional
    public Booking cancelBooking(Long id) {

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CANCELLED);

        List<Integer> seats = booking.getEffectiveSeatNumbers();
        redisService.unlockSeats(booking.getSchedule().getId(), seats);

        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }
}