package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sounds")
public class Sound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(length = 256)
    private String artistName;

    @Column(nullable = false, length = 32, unique = true)
    private String soundVideoId;

    @Column(nullable = false, length = 2048)
    private String soundUrl;

    @Column(length = 128)
    private String genre;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    protected Sound() {}

    public Sound(String title, String artistName, String soundVideoId, String soundUrl, String genre) {
        this.title = title;
        this.artistName = artistName;
        this.soundVideoId = soundVideoId;
        this.soundUrl = soundUrl;
        this.genre = genre;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getArtistName() { return artistName; }
    public String getSoundVideoId() { return soundVideoId; }
    public String getSoundUrl() { return soundUrl; }
    public String getGenre() { return genre; }
    public Instant getCreatedAt() { return createdAt; }

    public void setTitle(String title) { this.title = title; }
    public void setArtistName(String artistName) { this.artistName = artistName; }
    public void setSoundVideoId(String soundVideoId) { this.soundVideoId = soundVideoId; }
    public void setSoundUrl(String soundUrl) { this.soundUrl = soundUrl; }
    public void setGenre(String genre) { this.genre = genre; }
}
