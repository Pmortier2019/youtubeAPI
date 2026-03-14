package com.example.soundtracker.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(
        name = "video_snapshots",
        indexes = {
                @Index(name = "idx_snap_video_date", columnList = "videoId,snapshotDate")
        }
)
public class VideoSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 32)
    private String videoId;

    @Column(nullable = false)
    private LocalDate snapshotDate;

    @Column(nullable = false)
    private long viewCount;

    @Column(nullable = false)
    private long likeCount;

    @Column(nullable = false)
    private long commentCount;

    protected VideoSnapshot() {}

    public VideoSnapshot(String videoId, LocalDate snapshotDate, long viewCount, long likeCount, long commentCount) {
        this.videoId = videoId;
        this.snapshotDate = snapshotDate;
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
    }

    public Long getId() { return id; }
    public String getVideoId() { return videoId; }
    public LocalDate getSnapshotDate() { return snapshotDate; }
    public long getViewCount() { return viewCount; }
    public long getLikeCount() { return likeCount; }
    public long getCommentCount() { return commentCount; }
}