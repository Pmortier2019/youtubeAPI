package com.example.soundtracker.scheduler;

import com.example.soundtracker.service.StatsRefreshService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class DailyRefreshJob {

    private final StatsRefreshService refreshService;
    private final boolean enabled;

    public DailyRefreshJob(
            StatsRefreshService refreshService,
            @Value("${scheduler.enabled:true}") boolean enabled
    ) {
        this.refreshService = refreshService;
        this.enabled = enabled;
    }

    @Scheduled(cron = "${scheduler.cron}")
    public void run() {
        if (!enabled) return;
        refreshService.refreshToday();
    }
}