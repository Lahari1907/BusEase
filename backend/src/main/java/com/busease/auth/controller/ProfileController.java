package com.busease.auth.controller;

import com.busease.auth.dto.ProfileRequest;
import com.busease.auth.entity.User;
import com.busease.auth.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profile")
public class ProfileController {

    private final UserRepository userRepository;


    @GetMapping
    public User getProfile(Authentication authentication) {

        String email = authentication.getName();

        System.out.println("PROFILE EMAIL: " + email);

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );
    }


    @PutMapping
    public User updateProfile(
            Authentication authentication,
            @RequestBody ProfileRequest request
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        user.setName(request.getName());

        return userRepository.save(user);
    }
}