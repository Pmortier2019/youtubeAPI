package com.example.soundtracker.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(
        name = "short_videos",
        uniqueConstraints = @UniqueConstraint(columnNames = {"videoId"}),
        indexes = {
                @Index(name = "idx_short_video_creator", columnList = "creator"),
                @Index(name = "idx_short_video_id",      columnList = "videoId")
        }
)
public class ShortVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2048)
    private String url;

    @Column(nullable = false, length = 32)
    private String videoId;

    /** Denormalized display name — kept for admin stats grouping. */
    @Column(nullable = false, length = 128)
    private String creator;

    /** Proper FK to the channel this Short belongs to. Nullable for legacy rows. */
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "channel_id")
    private YoutubeChannel channel;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    /** null = not yet reviewed, true = uses the sound, false = does not */
    @Column
    private Boolean soundUsed;

    /** Total views that have already been included in a processed payout. */
    @Column(nullable = false)
    private long paidViews = 0L;

    protected ShortVideo() {}

    /** Use when no YoutubeChannel is available (manual admin add, legacy scraping). */
    public ShortVideo(String url, String videoId, String creator) {
        this(url, videoId, creator, null);
    }

    public ShortVideo(String url, String videoId, String creator, YoutubeChannel channel) {
        this.url = url;
        this.videoId = videoId;
        this.creator = creator;
        this.channel = channel;
    }

    public Long getId() { return id; }
    public String getUrl() { return url; }
    public String getVideoId() { return videoId; }
    public String getCreator() { return creator; }
    public YoutubeChannel getChannel() { return channel; }
    public Instant getCreatedAt() { return createdAt; }
    public Boolean getSoundUsed() { return soundUsed; }
    public void setSoundUsed(Boolean soundUsed) { this.soundUsed = soundUsed; }
    public long getPaidViews() { return paidViews; }
    public void setPaidViews(long paidViews) { this.paidViews = paidViews; }
}