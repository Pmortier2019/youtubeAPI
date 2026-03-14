package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "payment_methods")
public class PaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser appUser;

    @Column(nullable = false, length = 64)
    private String type;

    @Column(nullable = false, length = 512)
    private String details;

    @Column(nullable = false)
    private boolean isDefault;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected PaymentMethod() {}

    public PaymentMethod(AppUser appUser, String type, String details, boolean isDefault) {
        this.appUser = appUser;
        this.type = type;
        this.details = details;
        this.isDefault = isDefault;
    }

    public Long getId() { return id; }
    public AppUser getAppUser() { return appUser; }
    public String getType() { return type; }
    public String getDetails() { return details; }
    public boolean isDefault() { return isDefault; }
    public Instant getCreatedAt() { return createdAt; }

    public void setAppUser(AppUser appUser) { this.appUser = appUser; }
    public void setType(String type) { this.type = type; }
    public void setDetails(String details) { this.details = details; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }
}
