package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private AppUser user;

    @Column(nullable = false)
    private Instant expiresAt;

    protected EmailVerificationToken() {}

    public EmailVerificationToken(AppUser user, String token, Instant expiresAt) {
        this.user = user;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public String getToken() { return token; }
    public AppUser getUser() { return user; }
    public Instant getExpiresAt() { return expiresAt; }
}
