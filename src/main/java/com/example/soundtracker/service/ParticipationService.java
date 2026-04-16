package com.example.soundtracker.service;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.Campaign;
import com.example.soundtracker.domain.CampaignParticipation;
import com.example.soundtracker.domain.CampaignStatus;
import com.example.soundtracker.domain.ParticipationStatus;
import com.example.soundtracker.repo.CampaignParticipationRepository;
import com.example.soundtracker.repo.CampaignRepository;
import com.example.soundtracker.youtube.YouTubeApiClient;
import com.example.soundtracker.youtube.YouTubeVideoIdExtractor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
public class ParticipationService {

    private final CampaignRepository campaignRepo;
    private final CampaignParticipationRepository participationRepo;
    private final YouTubeApiClient youtubeApiClient;

    public ParticipationService(CampaignRepository campaignRepo,
                                CampaignParticipationRepository participationRepo,
                                YouTubeApiClient youtubeApiClient) {
        this.campaignRepo = campaignRepo;
        this.participationRepo = participationRepo;
        this.youtubeApiClient = youtubeApiClient;
    }

    @Transactional
    public CampaignParticipation joinCampaign(Long campaignId, AppUser user, String url) {
        String creatorName = user.getCreatorName();
        String videoId = YouTubeVideoIdExtractor.extract(url);

        Campaign campaign = campaignRepo.findById(campaignId)
                .orElseThrow(() -> new NoSuchElementException("No campaign with id: " + campaignId));

        if (campaign.getStatus() != CampaignStatus.ACTIVE) {
            throw new IllegalArgumentException("Campaign is not active");
        }

        if (participationRepo.existsByCampaignIdAndVideoId(campaignId, videoId)) {
            throw new IllegalArgumentException("Already participating with video: " + videoId);
        }

        if (campaign.getSpentBudget().compareTo(campaign.getTotalBudget()) >= 0) {
            throw new IllegalArgumentException("Campaign budget exhausted");
        }

        // Validate video duration against campaign rules
        Map<String, YouTubeApiClient.VideoDetail> details = youtubeApiClient.fetchVideoDetails(List.of(videoId));
        YouTubeApiClient.VideoDetail detail = details.get(videoId);
        if (detail == null) {
            throw new IllegalArgumentException("Video not found on YouTube: " + videoId);
        }
        long durationSeconds = detail.durationSeconds();
        if (durationSeconds < campaign.getMinDurationSeconds()) {
            throw new IllegalArgumentException(
                    "Video is too short: " + durationSeconds + "s (minimum is " + campaign.getMinDurationSeconds() + "s)");
        }
        if (durationSeconds > campaign.getMaxDurationSeconds()) {
            throw new IllegalArgumentException(
                    "Video is too long: " + durationSeconds + "s (maximum is " + campaign.getMaxDurationSeconds() + "s)");
        }

        CampaignParticipation participation = new CampaignParticipation(
                campaign,
                null,
                user,
                creatorName,
                url,
                videoId,
                ParticipationStatus.PENDING_REVIEW
        );
        return participationRepo.save(participation);
    }

    public List<CampaignParticipation> listByCampaign(Long campaignId) {
        return participationRepo.findByCampaignId(campaignId);
    }

    @Transactional
    public CampaignParticipation updateStatus(Long participationId, ParticipationStatus status) {
        CampaignParticipation participation = participationRepo.findById(participationId)
                .orElseThrow(() -> new NoSuchElementException("No participation with id: " + participationId));
        if (status == ParticipationStatus.APPROVED) {
            Campaign campaign = participation.getCampaign();
            if (campaign.getSpentBudget().compareTo(campaign.getTotalBudget()) >= 0) {
                throw new IllegalStateException("Cannot approve: campaign budget would be exceeded.");
            }
            participation.setApprovedAt(Instant.now());
        }
        participation.setStatus(status);
        return participationRepo.save(participation);
    }
}
