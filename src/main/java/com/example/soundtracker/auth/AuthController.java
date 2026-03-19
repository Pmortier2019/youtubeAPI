package com.example.soundtracker.auth;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.EmailVerificationToken;
import com.example.soundtracker.domain.Role;
import com.example.soundtracker.repo.AppUserRepository;
import com.example.soundtracker.repo.EmailVerificationTokenRepository;
import com.example.soundtracker.service.EmailService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final EmailVerificationTokenRepository tokenRepo;
    private final EmailService emailService;
    private final String appBaseUrl;

    public AuthController(AppUserRepository userRepo,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager,
                          JwtService jwtService,
                          EmailVerificationTokenRepository tokenRepo,
                          EmailService emailService,
                          @Value("${app.base-url}") String appBaseUrl) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.tokenRepo = tokenRepo;
        this.emailService = emailService;
        this.appBaseUrl = appBaseUrl;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String, String> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        AppUser user = new AppUser(
                req.email(),
                passwordEncoder.encode(req.password()),
                Role.CREATOR,
                req.creatorName()
        );
        userRepo.save(user);

        String token = UUID.randomUUID().toString();
        tokenRepo.save(new EmailVerificationToken(user, token, Instant.now().plus(24, ChronoUnit.HOURS)));

        String link = appBaseUrl + "/verify?token=" + token;
        emailService.sendVerificationEmail(user.getEmail(), user.getCreatorName(), link);

        return Map.of("message", "Registration successful! Check your email to verify your account.");
    }

    @GetMapping("/verify")
    @Transactional
    public AuthResponse verify(@RequestParam String token) {
        EmailVerificationToken record = tokenRepo.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired verification link"));

        if (record.getExpiresAt().isBefore(Instant.now())) {
            tokenRepo.delete(record);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Verification link has expired. Please register again.");
        }

        AppUser user = record.getUser();
        user.setEmailVerified(true);
        userRepo.save(user);
        tokenRepo.delete(record);

        return new AuthResponse(jwtService.generateToken(user));
    }

    @PostMapping("/resend-verification")
    @Transactional
    public Map<String, String> resendVerification(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        userRepo.findByEmail(email).ifPresent(user -> {
            if (!user.isEmailVerified()) {
                tokenRepo.deleteByUser(user);
                String token = UUID.randomUUID().toString();
                tokenRepo.save(new EmailVerificationToken(user, token, Instant.now().plus(24, ChronoUnit.HOURS)));
                String link = appBaseUrl + "/verify?token=" + token;
                emailService.sendVerificationEmail(user.getEmail(), user.getCreatorName(), link);
            }
        });
        // Always return the same message to avoid email enumeration
        return Map.of("message", "If that email exists and is unverified, a new link has been sent.");
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        AppUser user = userRepo.findByEmail(req.email()).orElseThrow();

        if (!user.isEmailVerified() && user.getRole() != com.example.soundtracker.domain.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Please verify your email before signing in.");
        }

        return new AuthResponse(jwtService.generateToken(user));
    }

    public record RegisterRequest(
            @Email @NotBlank String email,
            @NotBlank @Size(min = 8) String password,
            @NotBlank String creatorName
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(String token) {}
}
