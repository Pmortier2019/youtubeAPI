package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
    name = "creator_agreement_acceptances",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "agreement_version"})
)
public class CreatorAgreementAcceptance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "agreement_version", nullable = false, length = 20)
    private String agreementVersion;

    @Column(name = "accepted_at", nullable = false)
    private Instant acceptedAt;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    protected CreatorAgreementAcceptance() {}

    public CreatorAgreementAcceptance(AppUser user, String agreementVersion, Instant acceptedAt, String ipAddress, String userAgent) {
        this.user = user;
        this.agreementVersion = agreementVersion;
        this.acceptedAt = acceptedAt;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
    }

    public Long getId() { return id; }
    public AppUser getUser() { return user; }
    public String getAgreementVersion() { return agreementVersion; }
    public Instant getAcceptedAt() { return acceptedAt; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
}
