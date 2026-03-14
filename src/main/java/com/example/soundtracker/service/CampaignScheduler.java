package com.example.soundtracker.service;

import com.example.soundtracker.domain.Campaign;
import com.example.soundtracker.domain.CampaignStatus;
import com.example.soundtracker.repo.CampaignRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CampaignScheduler {

    private static final Logger log = LoggerFactory.getLogger(CampaignScheduler.class);

    private final CampaignRepository campaignRepo;

    public CampaignScheduler(CampaignRepository campaignRepo) {
        this.campaignRepo = campaignRepo;
    }

    /**
     * Runs daily at 02:30 AM. Closes campaigns where:
     * - endDate has passed, or
     * - budget is fully spent
     */
    @Scheduled(cron = "0 30 2 * * *")
    @Transactional
    public void autoCloseCampaigns() {
        LocalDate today = LocalDate.now();
        List<Campaign> campaigns = campaignRepo.findAll();
        int closed = 0;

        for (Campaign campaign : campaigns) {
            if (campaign.getStatus() == CampaignStatus.COMPLETED) continue;

            boolean endDatePassed = campaign.getEndDate() != null && campaign.getEndDate().isBefore(today);

            if (endDatePassed) {
                campaign.setStatus(CampaignStatus.COMPLETED);
                closed++;
                log.info("Auto-closed campaign {} (id={}) — end date {} has passed",
                        campaign.getTitle(), campaign.getId(), campaign.getEndDate());
            }
        }

        if (closed > 0) {
            campaignRepo.saveAll(campaigns);
            log.info("Auto-closed {} campaign(s)", closed);
        }
    }
}
