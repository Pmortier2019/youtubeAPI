package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "campaign_participations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"campaign_id", "videoId"}),
        indexes = {
                @Index(name = "idx_cp_creator_name", columnList = "creatorName"),
                @Index(name = "idx_cp_video_id",     columnList = "videoId")
        }
)
public class CampaignParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    @ManyToOne(optional = true)
    @JoinColumn(name = "short_video_id")
    private ShortVideo shortVideo;

    @Column(nullable = false, length = 128)
    private String creatorName;

    @Column(nullable = false, length = 2048)
    private String shortUrl;

    @Column(nullable = false, length = 32)
    private String videoId;

    @Column(nullable = false)
    private Instant joinedAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipationStatus status;

    @Column
    private Instant approvedAt;

    protected CampaignParticipation() {}

    public CampaignParticipation(Campaign campaign, ShortVideo shortVideo, String creatorName,
                                 String shortUrl, String videoId, ParticipationStatus status) {
        this.campaign = campaign;
        this.shortVideo = shortVideo;
        this.creatorName = creatorName;
        this.shortUrl = shortUrl;
        this.videoId = videoId;
        this.status = status;
    }

    public Long getId() { return id; }
    public Campaign getCampaign() { return campaign; }
    public ShortVideo getShortVideo() { return shortVideo; }
    public String getCreatorName() { return creatorName; }
    public String getShortUrl() { return shortUrl; }
    public String getVideoId() { return videoId; }
    public Instant getJoinedAt() { return joinedAt; }
    public ParticipationStatus getStatus() { return status; }
    public Instant getApprovedAt() { return approvedAt; }

    public void setCampaign(Campaign campaign) { this.campaign = campaign; }
    public void setShortVideo(ShortVideo shortVideo) { this.shortVideo = shortVideo; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }
    public void setShortUrl(String shortUrl) { this.shortUrl = shortUrl; }
    public void setVideoId(String videoId) { this.videoId = videoId; }
    public void setStatus(ParticipationStatus status) { this.status = status; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
}
