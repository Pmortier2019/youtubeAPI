package com.example.soundtracker.api;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateCampaignRequest(
        String title,
        String description,
        String soundVideoId,
        String soundUrl,
        BigDecimal rpmRate,
        BigDecimal totalBudget,
        int minDurationSeconds,
        int maxDurationSeconds,
        int minVolumePercent,
        LocalDate startDate,
        LocalDate endDate
) {}
