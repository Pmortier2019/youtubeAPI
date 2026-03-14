package com.example.soundtracker.service;

import com.example.soundtracker.api.CreateCampaignRequest;
import com.example.soundtracker.domain.Campaign;
import com.example.soundtracker.domain.CampaignStatus;
import com.example.soundtracker.repo.CampaignRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepo;

    public CampaignService(CampaignRepository campaignRepo) {
        this.campaignRepo = campaignRepo;
    }

    @Transactional
    public Campaign createCampaign(CreateCampaignRequest req) {
        Campaign campaign = new Campaign(
                req.title(),
                req.description(),
                req.soundVideoId(),
                req.soundUrl(),
                req.rpmRate(),
                req.totalBudget(),
                CampaignStatus.ACTIVE,
                req.startDate(),
                req.endDate()
        );
        campaign.setMinDurationSeconds(req.minDurationSeconds());
        campaign.setMaxDurationSeconds(req.maxDurationSeconds());
        campaign.setMinVolumePercent(req.minVolumePercent());
        return campaignRepo.save(campaign);
    }

    public List<Campaign> listAll() {
        return campaignRepo.findAll();
    }

    public List<Campaign> listActive() {
        return campaignRepo.findByStatus(CampaignStatus.ACTIVE);
    }

    @Transactional
    public Campaign updateStatus(Long id, CampaignStatus status) {
        Campaign campaign = campaignRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No campaign with id: " + id));
        campaign.setStatus(status);
        return campaignRepo.save(campaign);
    }
}
