package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.domain.VideoSnapshot;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.repo.VideoSnapshotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class StatsService {

    private final ShortVideoRepository shortRepo;
    private final VideoSnapshotRepository snapshotRepo;

    public StatsService(ShortVideoRepository shortRepo, VideoSnapshotRepository snapshotRepo) {
        this.shortRepo = shortRepo;
        this.snapshotRepo = snapshotRepo;
    }

    /** Latest snapshot for every tracked video. */
    public List<VideoSummary> videoSummaries() {
        Map<String, ShortVideo> byId = shortRepo.findAll().stream()
                .collect(Collectors.toMap(ShortVideo::getVideoId, v -> v));

        return snapshotRepo.findLatestPerVideo().stream()
                .map(s -> {
                    ShortVideo v = byId.get(s.getVideoId());
                    return new VideoSummary(
                            s.getVideoId(),
                            v != null ? v.getUrl() : null,
                            v != null ? v.getCreator() : null,
                            s.getViewCount(), s.getLikeCount(), s.getCommentCount(),
                            s.getSnapshotDate()
                    );
                })
                .sorted(Comparator.comparingLong(VideoSummary::views).reversed())
                .toList();
    }

    /** Full snapshot history for a single video. */
    public VideoHistory videoHistory(String videoId) {
        ShortVideo video = shortRepo.findByVideoId(videoId)
                .orElseThrow(() -> new NoSuchElementException("Unknown video: " + videoId));

        List<DailySnapshot> snaps = snapshotRepo.findByVideoIdOrderBySnapshotDateAsc(videoId)
                .stream()
                .map(s -> new DailySnapshot(s.getSnapshotDate(), s.getViewCount(), s.getLikeCount(), s.getCommentCount()))
                .toList();

        return new VideoHistory(videoId, video.getUrl(), video.getCreator(), snaps);
    }

    /** Sum of latest view counts grouped by creator, descending. */
    public List<CreatorSummary> creatorSummaries() {
        Map<String, ShortVideo> byId = shortRepo.findAll().stream()
                .collect(Collectors.toMap(ShortVideo::getVideoId, v -> v));

        return snapshotRepo.findLatestPerVideo().stream()
                .filter(s -> byId.containsKey(s.getVideoId()))
                .collect(Collectors.groupingBy(
                        s -> byId.get(s.getVideoId()).getCreator(),
                        Collectors.summingLong(VideoSnapshot::getViewCount)
                ))
                .entrySet().stream()
                .map(e -> new CreatorSummary(e.getKey(), e.getValue()))
                .sorted(Comparator.comparingLong(CreatorSummary::totalViews).reversed())
                .toList();
    }

    public record VideoSummary(
            String videoId, String url, String creator,
            long views, long likes, long comments,
            LocalDate snapshotDate) {}

    public record DailySnapshot(LocalDate date, long views, long likes, long comments) {}

    public record VideoHistory(String videoId, String url, String creator, List<DailySnapshot> history) {}

    public record CreatorSummary(String creator, long totalViews) {}
}
