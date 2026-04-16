package com.example.soundtracker.repo;

import com.example.soundtracker.domain.CampaignParticipation;
import com.example.soundtracker.domain.ParticipationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignParticipationRepository extends JpaRepository<CampaignParticipation, Long> {
    List<CampaignParticipation> findByCampaignId(Long id);
    List<CampaignParticipation> findByCampaignIdAndStatus(Long id, ParticipationStatus status);
    List<CampaignParticipation> findByCreatorName(String name);
    List<CampaignParticipation> findByCreatorNameAndStatus(String creatorName, ParticipationStatus status);
    List<CampaignParticipation> findByAppUserIdAndStatus(Long appUserId, ParticipationStatus status);
    boolean existsByCampaignIdAndVideoId(Long campaignId, String videoId);
}
