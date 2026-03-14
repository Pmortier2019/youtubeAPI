package com.example.soundtracker.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payouts")
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** FK to the account that receives this payout. */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser appUser;

    /** Snapshot of the display name at time of payout — kept for admin history. */
    @Column(nullable = false, length = 128)
    private String creatorName;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(nullable = false)
    private int month;

    @Column(nullable = false)
    private int year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayoutStatus status;

    @Column(nullable = false, length = 64)
    private String paymentMethod;

    @Column(nullable = false, length = 512)
    private String paymentDetails;

    @Column(nullable = false)
    private Instant requestedAt = Instant.now();

    @Column
    private Instant paidAt;

    protected Payout() {}

    public Payout(AppUser appUser, BigDecimal amount, int month, int year,
                  PayoutStatus status, String paymentMethod, String paymentDetails) {
        this.appUser = appUser;
        this.creatorName = appUser.getCreatorName();
        this.amount = amount;
        this.month = month;
        this.year = year;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.paymentDetails = paymentDetails;
    }

    public Long getId() { return id; }
    public AppUser getAppUser() { return appUser; }
    public String getCreatorName() { return creatorName; }
    public BigDecimal getAmount() { return amount; }
    public int getMonth() { return month; }
    public int getYear() { return year; }
    public PayoutStatus getStatus() { return status; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentDetails() { return paymentDetails; }
    public Instant getRequestedAt() { return requestedAt; }
    public Instant getPaidAt() { return paidAt; }

    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setMonth(int month) { this.month = month; }
    public void setYear(int year) { this.year = year; }
    public void setStatus(PayoutStatus status) { this.status = status; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }
}
