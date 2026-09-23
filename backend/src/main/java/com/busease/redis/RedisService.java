package com.busease.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    public String getSeatLockKey(Long scheduleId, int seatNumber) {
        return "seat_" + seatNumber + "_schedule_" + scheduleId;
    }

    // Save value
    public void setValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    // Get value
    public String getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // ✅ Updated (NO deprecation)
    public void setValueWithExpiry(String key, String value, long seconds) {
        log.info("Setting Redis key [{}] with expiry {} seconds", key, seconds);
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(seconds));
    }

    // Delete
    public void deleteKey(String key) {
        log.info("Deleting Redis key [{}]", key);
        redisTemplate.delete(key);
    }

    public void lockSeats(Long scheduleId, java.util.List<Integer> seatNumbers, Long userId, long ttlSeconds) {
        if (seatNumbers == null) return;
        for (Integer seat : seatNumbers) {
            String key = getSeatLockKey(scheduleId, seat);
            setValueWithExpiry(key, userId.toString(), ttlSeconds);
        }
    }

    public void unlockSeats(Long scheduleId, java.util.List<Integer> seatNumbers) {
        if (seatNumbers == null) return;
        for (Integer seat : seatNumbers) {
            String key = getSeatLockKey(scheduleId, seat);
            deleteKey(key);
        }
    }
}