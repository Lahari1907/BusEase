package com.busease.security;

import com.busease.auth.entity.User;
import com.busease.auth.repository.UserRepository;
import com.busease.exception.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SecurityUtils {

    public static Optional<String> getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof String stringPrincipal) {
            return Optional.of(stringPrincipal);
        }
        return Optional.ofNullable(authentication.getName());
    }

    public static User getLoggedInUser(UserRepository userRepository) {
        String email = getCurrentUserEmail()
                .orElseThrow(() -> new IllegalStateException("User is not authenticated"));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Logged in user not found in database: " + email));
    }
}
