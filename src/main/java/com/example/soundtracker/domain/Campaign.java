package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 32)
    private String soundVideoId;

    @Column(nullable = false, length = 2048)
    private String soundUrl;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal rpmRate;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal totalBudget;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal spentBudget = BigDecimal.ZERO;

    @Column(nullable = false)
    private int minDurationSeconds = 35;

    @Column(nullable = false)
    private int maxDurationSeconds = 60;

    @Column(nullable = false)
    private int minVolumePercent = 15;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    protected Campaign() {}

    public Campaign(String title, String description, String soundVideoId, String soundUrl,
                    BigDecimal rpmRate, BigDecimal totalBudget, CampaignStatus status,
                    LocalDate startDate, LocalDate endDate) {
        this.title = title;
        this.description = description;
        this.soundVideoId = soundVideoId;
        this.soundUrl = soundUrl;
        this.rpmRate = rpmRate;
        this.totalBudget = totalBudget;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSoundVideoId() { return soundVideoId; }
    public String getSoundUrl() { return soundUrl; }
    public BigDecimal getRpmRate() { return rpmRate; }
    public BigDecimal getTotalBudget() { return totalBudget; }
    public BigDecimal getSpentBudget() { return spentBudget; }
    public int getMinDurationSeconds() { return minDurationSeconds; }
    public int getMaxDurationSeconds() { return maxDurationSeconds; }
    public int getMinVolumePercent() { return minVolumePercent; }
    public CampaignStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setSoundVideoId(String soundVideoId) { this.soundVideoId = soundVideoId; }
    public void setSoundUrl(String soundUrl) { this.soundUrl = soundUrl; }
    public void setRpmRate(BigDecimal rpmRate) { this.rpmRate = rpmRate; }
    public void setTotalBudget(BigDecimal totalBudget) { this.totalBudget = totalBudget; }
    public void setSpentBudget(BigDecimal spentBudget) { this.spentBudget = spentBudget; }
    public void setMinDurationSeconds(int minDurationSeconds) { this.minDurationSeconds = minDurationSeconds; }
    public void setMaxDurationSeconds(int maxDurationSeconds) { this.maxDurationSeconds = maxDurationSeconds; }
    public void setMinVolumePercent(int minVolumePercent) { this.minVolumePercent = minVolumePercent; }
    public void setStatus(CampaignStatus status) { this.status = status; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
}
