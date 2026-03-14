package com.example.soundtracker.repo;

import com.example.soundtracker.domain.Campaign;
import com.example.soundtracker.domain.CampaignStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByStatus(CampaignStatus status);
}
