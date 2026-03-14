package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.domain.VideoSnapshot;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.repo.VideoSnapshotRepository;
import com.example.soundtracker.youtube.YouTubeApiClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class StatsRefreshService {

    private final ShortVideoRepository shortRepo;
    private final VideoSnapshotRepository snapshotRepo;
    private final YouTubeApiClient yt;
    private final int batchSize;

    public StatsRefreshService(
            ShortVideoRepository shortRepo,
            VideoSnapshotRepository snapshotRepo,
            YouTubeApiClient yt,
            @Value("${youtube.batchSize:50}") int batchSize
    ) {
        this.shortRepo = shortRepo;
        this.snapshotRepo = snapshotRepo;
        this.yt = yt;
        this.batchSize = Math.min(Math.max(batchSize, 1), 50);
    }

    @Transactional
    public int refreshToday() {
        LocalDate today = LocalDate.now();

        // Only track stats for approved shorts — pending/rejected don't count for payouts
        List<ShortVideo> shorts = shortRepo.findBySoundUsedTrue();
        List<String> ids = shorts.stream().map(ShortVideo::getVideoId).distinct().toList();

        int created = 0;

        for (List<String> batch : batches(ids, batchSize)) {
            Map<String, YouTubeApiClient.VideoStats> statsMap = yt.fetchStats(batch);

            for (String id : batch) {
                var maybeExisting = snapshotRepo.findTopByVideoIdAndSnapshotDateOrderByIdDesc(id, today);
                if (maybeExisting.isPresent()) continue;

                var s = statsMap.get(id);
                if (s == null) continue;

                snapshotRepo.save(new VideoSnapshot(id, today, s.views(), s.likes(), s.comments()));
                created++;
            }
        }

        return created;
    }

    private List<List<String>> batches(List<String> ids, int size) {
        List<List<String>> out = new ArrayList<>();
        for (int i = 0; i < ids.size(); i += size) {
            out.add(ids.subList(i, Math.min(i + size, ids.size())));
        }
        return out;
    }
}