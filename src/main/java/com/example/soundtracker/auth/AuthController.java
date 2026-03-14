package com.example.soundtracker.auth;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.Role;
import com.example.soundtracker.repo.AppUserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthController(AppUserRepository userRepo,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authManager,
                          JwtService jwtService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
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

        return new AuthResponse(jwtService.generateToken(user));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password()));

        AppUser user = userRepo.findByEmail(req.email()).orElseThrow();
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
