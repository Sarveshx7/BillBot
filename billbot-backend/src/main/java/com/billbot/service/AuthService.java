package com.billbot.service;

import com.billbot.dto.LoginRequest;
import com.billbot.dto.LoginResponse;
import com.billbot.dto.RegisterRequest;
import com.billbot.entity.User;
import com.billbot.repository.UserRepository;
import com.billbot.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // =========================
    // REGISTER
    // =========================

    public LoginResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();

        user.setName(request.getName().trim());
        user.setEmail(email);

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String uname = request.getUsername().trim().toLowerCase();
            if (userRepository.existsByUsername(uname)) {
                throw new RuntimeException("Username is already taken");
            }
            user.setUsername(uname);
        } else {
            String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();
            user.setUsername(base);
        }

        // Never store the raw password
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        User savedUser = userRepository.save(user);
        return createLoginResponse(savedUser);
    }


    // =========================
    // LOGIN
    // =========================

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        // Compare entered password with BCrypt hash
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid email or password");
        }

        // Generate JWT after successful authentication
        return createLoginResponse(user);
    }

    private LoginResponse createLoginResponse(User user) {
        String token = jwtService.generateToken(user.getId().toString(), user.getEmail());
        return new LoginResponse(token, "Bearer", user);
    }
}
