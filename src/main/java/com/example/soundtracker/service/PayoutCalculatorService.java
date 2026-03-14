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

        List<ShortVideo> shorts = shortRepo.findAll();

        Map<String, Long> creatorViews = new HashMap<>();

        for (ShortVideo sv : shorts) {
            long startViews = findViewsOnDate(sv.getVideoId(), start);
            long endViews = findViewsOnDate(sv.getVideoId(), end);
            long growth = Math.max(0, endViews - startViews);

            creatorViews.merge(sv.getCreator(), growth, Long::sum);
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

    private long findViewsOnDate(String videoId, LocalDate date) {
        Optional<VideoSnapshot> snap = snapRepo.findTopByVideoIdAndSnapshotDateOrderByIdDesc(videoId, date);
        return snap.map(VideoSnapshot::getViewCount).orElse(0L);
    }

    public record PayoutLine(String creator, long monthViews, BigDecimal share, BigDecimal payout) {}
    public record PayoutReport(String yearMonth, BigDecimal pot, long totalMonthViews, List<PayoutLine> lines) {}
}
