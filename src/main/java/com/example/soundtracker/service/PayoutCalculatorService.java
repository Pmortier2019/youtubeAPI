package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.domain.VideoSnapshot;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.repo.VideoSnapshotRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PayoutCalculatorService {

    private final ShortVideoRepository shortRepo;
    private final VideoSnapshotRepository snapRepo;

    public PayoutCalculatorService(ShortVideoRepository shortRepo, VideoSnapshotRepository snapRepo) {
        this.shortRepo = shortRepo;
        this.snapRepo = snapRepo;
    }

    public PayoutReport payout(YearMonth ym, BigDecimal pot) {
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // Load all shorts and build a videoId -> creator map in one query
        List<ShortVideo> shorts = shortRepo.findAll();
        Map<String, String> videoCreator = shorts.stream()
                .collect(Collectors.toMap(ShortVideo::getVideoId, ShortVideo::getCreator, (a, b) -> a));

        // Fetch all snapshots for start and end date in two bulk queries (not N×2 queries)
        Map<String, Long> startViews = snapshotsByDate(start);
        Map<String, Long> endViews = snapshotsByDate(end);

        Map<String, Long> creatorViews = new HashMap<>();
        for (String videoId : videoCreator.keySet()) {
            long growth = Math.max(0, endViews.getOrDefault(videoId, 0L) - startViews.getOrDefault(videoId, 0L));
            creatorViews.merge(videoCreator.get(videoId), growth, Long::sum);
        }

        long total = creatorViews.values().stream().mapToLong(Long::longValue).sum();

        List<PayoutLine> lines = new ArrayList<>();
        for (var e : creatorViews.entrySet()) {
            String creator = e.getKey();
            long views = e.getValue();

            BigDecimal share = (total == 0)
                    ? BigDecimal.ZERO
                    : BigDecimal.valueOf(views).divide(BigDecimal.valueOf(total), 8, RoundingMode.HALF_UP);

            BigDecimal payout = pot.multiply(share).setScale(2, RoundingMode.HALF_UP);
            lines.add(new PayoutLine(creator, views, share, payout));
        }

        lines.sort(Comparator.comparing(PayoutLine::monthViews).reversed());
        return new PayoutReport(ym.toString(), pot, total, lines);
    }

    /** Returns a videoId -> viewCount map for all snapshots on the given date. */
    private Map<String, Long> snapshotsByDate(LocalDate date) {
        return snapRepo.findBySnapshotDateIn(List.of(date)).stream()
                .collect(Collectors.toMap(
                        VideoSnapshot::getVideoId,
                        VideoSnapshot::getViewCount,
                        Long::max  // keep highest if multiple snapshots per day
                ));
    }

    public record PayoutLine(String creator, long monthViews, BigDecimal share, BigDecimal payout) {}
    public record PayoutReport(String yearMonth, BigDecimal pot, long totalMonthViews, List<PayoutLine> lines) {}
}
