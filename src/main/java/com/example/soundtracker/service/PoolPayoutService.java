package com.example.soundtracker.service;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.Campaign;
import com.example.soundtracker.domain.CampaignParticipation;
import com.example.soundtracker.domain.ParticipationStatus;
import com.example.soundtracker.domain.PaymentMethod;
import com.example.soundtracker.domain.Payout;
import com.example.soundtracker.domain.PayoutStatus;
import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.domain.VideoSnapshot;
import com.example.soundtracker.repo.AppUserRepository;
import com.example.soundtracker.repo.CampaignParticipationRepository;
import com.example.soundtracker.repo.CampaignRepository;
import com.example.soundtracker.repo.PaymentMethodRepository;
import com.example.soundtracker.repo.PayoutRepository;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.repo.VideoSnapshotRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
public class PoolPayoutService {

    private final ShortVideoRepository shortRepo;
    private final VideoSnapshotRepository snapRepo;
    private final PayoutRepository payoutRepo;
    private final AppUserRepository appUserRepo;
    private final PaymentMethodRepository paymentMethodRepo;
    private final CampaignParticipationRepository participationRepo;
    private final CampaignRepository campaignRepo;

    private final EmailService emailService;

    public PoolPayoutService(ShortVideoRepository shortRepo,
                             VideoSnapshotRepository snapRepo,
                             PayoutRepository payoutRepo,
                             AppUserRepository appUserRepo,
                             PaymentMethodRepository paymentMethodRepo,
                             CampaignParticipationRepository participationRepo,
                             CampaignRepository campaignRepo,
                             EmailService emailService) {
        this.shortRepo = shortRepo;
        this.snapRepo = snapRepo;
        this.payoutRepo = payoutRepo;
        this.appUserRepo = appUserRepo;
        this.paymentMethodRepo = paymentMethodRepo;
        this.participationRepo = participationRepo;
        this.campaignRepo = campaignRepo;
        this.emailService = emailService;
    }

    public record PayoutLineDto(
            String creator,
            long newViews,
            double sharePercent,
            double payout,
            String paymentMethod,
            String paymentDetails
    ) {}

    /**
     * Preview what each creator would receive from the given pot.
     * No DB writes occur.
     */
    public List<PayoutLineDto> previewPayout(double pot) {
        List<ShortVideo> videos = shortRepo.findBySoundUsedTrue();

        // Group new views (latestViews - paidViews) per creator
        Map<String, Long> creatorNewViews = new LinkedHashMap<>();
        for (ShortVideo sv : videos) {
            long latest = getLatestViews(sv.getVideoId());
            long newViews = Math.max(0L, latest - sv.getPaidViews());
            creatorNewViews.merge(sv.getCreator(), newViews, Long::sum);
        }

        long totalNewViews = creatorNewViews.values().stream().mapToLong(Long::longValue).sum();
        if (totalNewViews == 0) {
            return List.of();
        }

        List<PayoutLineDto> lines = new ArrayList<>();
        for (Map.Entry<String, Long> entry : creatorNewViews.entrySet()) {
            String creator = entry.getKey();
            long views = entry.getValue();
            double sharePercent = (double) views / totalNewViews;
            double payout = Math.round(sharePercent * pot * 100.0) / 100.0;

            String paymentMethod = null;
            String paymentDetails = null;
            Optional<AppUser> userOpt = appUserRepo.findByCreatorName(creator);
            if (userOpt.isPresent()) {
                List<PaymentMethod> methods = paymentMethodRepo.findByAppUserId(userOpt.get().getId());
                PaymentMethod preferred = methods.stream()
                        .filter(PaymentMethod::isDefault)
                        .findFirst()
                        .orElse(methods.isEmpty() ? null : methods.get(0));
                if (preferred != null) {
                    paymentMethod = preferred.getType();
                    paymentDetails = preferred.getDetails();
                }
            }

            lines.add(new PayoutLineDto(creator, views, sharePercent, payout, paymentMethod, paymentDetails));
        }

        lines.sort(Comparator.comparingDouble(PayoutLineDto::payout).reversed());
        return lines;
    }

    /**
     * Process and persist the payout. Marks all soundUsed videos as paid
     * (paidViews = latest views). Saves a Payout record per creator.
     */
    @Transactional
    public List<PayoutLineDto> processPayout(double pot) {
        List<PayoutLineDto> lines = previewPayout(pot);
        if (lines.isEmpty()) {
            return lines;
        }

        LocalDate today = LocalDate.now();
        int month = today.getMonthValue();
        int year = today.getYear();

        // Save a Payout record for each creator and send email notification
        for (PayoutLineDto line : lines) {
            Optional<AppUser> userOpt = appUserRepo.findByCreatorName(line.creator());
            if (userOpt.isEmpty()) continue; // skip if no matching account found

            AppUser user = userOpt.get();
            String method = line.paymentMethod() != null ? line.paymentMethod() : "UNKNOWN";
            String details = line.paymentDetails() != null ? line.paymentDetails() : "";
            BigDecimal amount = BigDecimal.valueOf(line.payout());

            Payout payout = new Payout(user, amount, month, year, PayoutStatus.PENDING, method, details);
            payoutRepo.save(payout);

            emailService.sendPayoutNotification(user.getEmail(), line.creator(), amount);
        }

        // Mark all soundUsed videos as paid: paidViews = latest views
        List<ShortVideo> videos = shortRepo.findBySoundUsedTrue();
        for (ShortVideo sv : videos) {
            long latest = getLatestViews(sv.getVideoId());
            sv.setPaidViews(latest);
        }
        shortRepo.saveAll(videos);

        // Update spentBudget per campaign based on what was actually paid out.
        // For each creator's payout, distribute it proportionally across their
        // approved campaign participations based on relative view counts.
        updateCampaignSpentBudgets(lines);

        return lines;
    }

    private void updateCampaignSpentBudgets(List<PayoutLineDto> lines) {
        Map<Long, BigDecimal> budgetAdditions = new HashMap<>();

        for (PayoutLineDto line : lines) {
            List<CampaignParticipation> participations =
                    participationRepo.findByCreatorNameAndStatus(line.creator(), ParticipationStatus.APPROVED);

            if (participations.isEmpty()) continue;

            // Total views across all approved participations for this creator
            long totalViews = participations.stream()
                    .mapToLong(p -> getLatestViews(p.getVideoId()))
                    .sum();

            if (totalViews == 0) continue;

            BigDecimal creatorPayout = BigDecimal.valueOf(line.payout());

            for (CampaignParticipation p : participations) {
                long views = getLatestViews(p.getVideoId());
                BigDecimal share = BigDecimal.valueOf(views)
                        .divide(BigDecimal.valueOf(totalViews), 8, RoundingMode.HALF_UP);
                BigDecimal campaignPortion = creatorPayout.multiply(share).setScale(4, RoundingMode.HALF_UP);
                budgetAdditions.merge(p.getCampaign().getId(), campaignPortion, BigDecimal::add);
            }
        }

        if (budgetAdditions.isEmpty()) return;

        List<Campaign> campaigns = campaignRepo.findAllById(budgetAdditions.keySet());
        for (Campaign campaign : campaigns) {
            BigDecimal addition = budgetAdditions.get(campaign.getId());
            if (addition != null) {
                campaign.setSpentBudget(campaign.getSpentBudget().add(addition));
            }
        }
        campaignRepo.saveAll(campaigns);
    }

    private long getLatestViews(String videoId) {
        Optional<VideoSnapshot> snap = snapRepo.findTopByVideoIdOrderBySnapshotDateDesc(videoId);
        return snap.map(VideoSnapshot::getViewCount).orElse(0L);
    }
}
