package com.example.soundtracker.service;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.CampaignParticipation;
import com.example.soundtracker.domain.ParticipationStatus;
import com.example.soundtracker.domain.Payout;
import com.example.soundtracker.domain.PayoutStatus;
import com.example.soundtracker.domain.VideoSnapshot;
import com.example.soundtracker.repo.CampaignParticipationRepository;
import com.example.soundtracker.repo.PayoutRepository;
import com.example.soundtracker.repo.VideoSnapshotRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class EarningsService {

    private final CampaignParticipationRepository participationRepo;
    private final VideoSnapshotRepository snapshotRepo;
    private final PayoutRepository payoutRepo;

    public EarningsService(CampaignParticipationRepository participationRepo,
                           VideoSnapshotRepository snapshotRepo,
                           PayoutRepository payoutRepo) {
        this.participationRepo = participationRepo;
        this.snapshotRepo = snapshotRepo;
        this.payoutRepo = payoutRepo;
    }

    public EarningsSummary getEarnings(AppUser user) {
        List<CampaignParticipation> approved = participationRepo
                .findByCreatorNameAndStatus(user.getCreatorName(), ParticipationStatus.APPROVED);

        List<CampaignEarning> breakdown = new ArrayList<>();
        BigDecimal totalEarned = BigDecimal.ZERO;

        for (CampaignParticipation participation : approved) {
            String videoId = participation.getVideoId();
            Optional<VideoSnapshot> snapshot = snapshotRepo.findTopByVideoIdOrderBySnapshotDateDesc(videoId);
            long views = snapshot.map(VideoSnapshot::getViewCount).orElse(0L);

            BigDecimal rpmRate = participation.getCampaign().getRpmRate();
            BigDecimal earned = BigDecimal.valueOf(views)
                    .multiply(rpmRate)
                    .divide(BigDecimal.valueOf(1000), 4, RoundingMode.HALF_UP);

            totalEarned = totalEarned.add(earned);
            breakdown.add(new CampaignEarning(
                    participation.getCampaign().getId(),
                    participation.getCampaign().getTitle(),
                    views,
                    earned
            ));
        }

        List<Payout> paidPayouts = payoutRepo.findByAppUserIdAndStatus(user.getId(), PayoutStatus.PAID);
        BigDecimal totalPaid = paidPayouts.stream()
                .map(Payout::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingPayout = totalEarned.subtract(totalPaid);

        return new EarningsSummary(totalEarned, totalPaid, pendingPayout, breakdown);
    }

    public record CampaignEarning(Long campaignId, String campaignTitle, long views, BigDecimal earned) {}

    public record EarningsSummary(
            BigDecimal totalEarned,
            BigDecimal totalPaid,
            BigDecimal pendingPayout,
            List<CampaignEarning> breakdown
    ) {}
}
