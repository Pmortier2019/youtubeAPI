package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "youtube_channels")
public class YoutubeChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser appUser;

    @Column(nullable = false)
    private String channelId; // UCxxxxx

    private String channelHandle; // @handle

    private String channelName;

    @Column(nullable = false)
    private LocalDateTime addedAt = LocalDateTime.now();

    private LocalDateTime lastScrapedAt;

    protected YoutubeChannel() {}

    public YoutubeChannel(AppUser appUser, String channelId, String channelHandle, String channelName) {
        this.appUser = appUser;
        this.channelId = channelId;
        this.channelHandle = channelHandle;
        this.channelName = channelName;
    }

    public Long getId() { return id; }
    public AppUser getAppUser() { return appUser; }
    public String getChannelId() { return channelId; }
    public String getChannelHandle() { return channelHandle; }
    public void setChannelHandle(String channelHandle) { this.channelHandle = channelHandle; }
    public String getChannelName() { return channelName; }
    public void setChannelName(String channelName) { this.channelName = channelName; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public LocalDateTime getLastScrapedAt() { return lastScrapedAt; }
    public void setLastScrapedAt(LocalDateTime lastScrapedAt) { this.lastScrapedAt = lastScrapedAt; }
}
