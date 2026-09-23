package com.busease.booking.repository;

import com.busease.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT COUNT(b) > 0 FROM Booking b LEFT JOIN b.seatNumbers s WHERE b.schedule.id = :scheduleId AND b.status = com.busease.booking.entity.BookingStatus.CONFIRMED AND (s = :seatNumber OR b.seatNumber = :seatNumber)")
    boolean isSeatBooked(@Param("scheduleId") Long scheduleId, @Param("seatNumber") int seatNumber);

    @Query("SELECT COUNT(b) > 0 FROM Booking b LEFT JOIN b.seatNumbers s WHERE b.schedule.id = :scheduleId AND b.status = com.busease.booking.entity.BookingStatus.CONFIRMED AND (s IN :seatNumbers OR b.seatNumber IN :seatNumbers)")
    boolean areAnySeatsBooked(@Param("scheduleId") Long scheduleId, @Param("seatNumbers") List<Integer> seatNumbers);

    default boolean existsByScheduleIdAndSeatNumber(Long scheduleId, int seatNumber) {
        return isSeatBooked(scheduleId, seatNumber);
    }

    @Query("SELECT b FROM Booking b LEFT JOIN b.seatNumbers s WHERE b.schedule.id = :scheduleId AND b.status = com.busease.booking.entity.BookingStatus.CONFIRMED AND (s = :seatNumber OR b.seatNumber = :seatNumber)")
    List<Booking> findBookingsByScheduleIdAndSeatNumber(@Param("scheduleId") Long scheduleId, @Param("seatNumber") int seatNumber);

    default Optional<Booking> findByScheduleIdAndSeatNumber(Long scheduleId, int seatNumber) {
        List<Booking> list = findBookingsByScheduleIdAndSeatNumber(scheduleId, seatNumber);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    List<Booking> findByUserIdOrderByBookingTimeDesc(Long userId);

    Page<Booking> findByUserId(Long userId, Pageable pageable);
}