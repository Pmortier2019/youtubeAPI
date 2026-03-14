package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.CampaignParticipation;
import com.example.soundtracker.domain.Payout;
import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.repo.CampaignParticipationRepository;
import com.example.soundtracker.repo.PayoutRepository;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.service.PayoutCalculatorService;
import com.example.soundtracker.service.StatsService;
import com.example.soundtracker.service.StatsService.VideoSummary;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.List;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final StatsService statsService;
    private final PayoutCalculatorService payoutService;
    private final ShortVideoRepository shortVideoRepository;
    private final PayoutRepository payoutRepository;
    private final CampaignParticipationRepository participationRepository;

    public MeController(StatsService statsService, PayoutCalculatorService payoutService,
                        ShortVideoRepository shortVideoRepository, PayoutRepository payoutRepository,
                        CampaignParticipationRepository participationRepository) {
        this.statsService = statsService;
        this.payoutService = payoutService;
        this.shortVideoRepository = shortVideoRepository;
        this.payoutRepository = payoutRepository;
        this.participationRepository = participationRepository;
    }

    record MyShortDto(String videoId, String url, Boolean soundUsed, LocalDateTime createdAt) {}

    record MyParticipationDto(
            Long participationId,
            Long campaignId,
            String campaignTitle,
            String videoId,
            String shortUrl,
            String status,
            LocalDateTime joinedAt
    ) {}

    /** Own shorts with their latest stats. */
    @GetMapping("/stats")
    public List<VideoSummary> myStats(@AuthenticationPrincipal AppUser user) {
        // Collect videoIds from channels owned by this user
        Set<String> myVideoIds = shortVideoRepository.findByChannelAppUserId(user.getId())
                .stream()
                .map(ShortVideo::getVideoId)
                .collect(Collectors.toSet());

        return statsService.videoSummaries().stream()
                .filter(v -> myVideoIds.contains(v.videoId()))
                .toList();
    }

    /** Own shorts with their review status, sorted by createdAt descending. */
    @GetMapping("/shorts")
    public List<MyShortDto> myShorts(@AuthenticationPrincipal AppUser user) {
        return shortVideoRepository.findByChannelAppUserId(user.getId()).stream()
                .sorted(Comparator.comparing(ShortVideo::getCreatedAt).reversed())
                .map(s -> new MyShortDto(
                        s.getVideoId(),
                        s.getUrl(),
                        s.getSoundUsed(),
                        LocalDateTime.ofInstant(s.getCreatedAt(), ZoneOffset.UTC)
                ))
                .toList();
    }

    /** Own campaign participations with their current status. */
    @GetMapping("/participations")
    public List<MyParticipationDto> myParticipations(@AuthenticationPrincipal AppUser user) {
        return participationRepository.findByCreatorName(user.getCreatorName()).stream()
                .sorted(Comparator.comparing(CampaignParticipation::getJoinedAt).reversed())
                .map(p -> new MyParticipationDto(
                        p.getId(),
                        p.getCampaign().getId(),
                        p.getCampaign().getTitle(),
                        p.getVideoId(),
                        p.getShortUrl(),
                        p.getStatus().name(),
                        LocalDateTime.ofInstant(p.getJoinedAt(), ZoneOffset.UTC)
                ))
                .toList();
    }

    /** Own payout history sorted by requestedAt descending. */
    @GetMapping("/payouts")
    public List<Payout> myPayouts(@AuthenticationPrincipal AppUser user) {
        return payoutRepository.findByAppUserId(user.getId()).stream()
                .sorted(Comparator.comparing(Payout::getRequestedAt).reversed())
                .toList();
    }

    /**
     * Own payout for a given month.
     * The pot is provided by the admin — creators can see their own slice.
     */
    @GetMapping("/payout")
    public PayoutCalculatorService.PayoutLine myPayout(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam BigDecimal pot,
            @AuthenticationPrincipal AppUser user
    ) {
        PayoutCalculatorService.PayoutReport report = payoutService.payout(YearMonth.of(year, month), pot);
        return report.lines().stream()
                .filter(line -> user.getCreatorName().equals(line.creator()))
                .findFirst()
                .orElse(new PayoutCalculatorService.PayoutLine(user.getCreatorName(), 0, BigDecimal.ZERO, BigDecimal.ZERO));
    }
}
