package com.example.soundtracker.scheduler;

import com.example.soundtracker.service.YoutubeChannelService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ChannelScheduler {

    private static final Logger log = LoggerFactory.getLogger(ChannelScheduler.class);

    private final YoutubeChannelService channelService;

    public ChannelScheduler(YoutubeChannelService channelService) {
        this.channelService = channelService;
    }

    /** Scrape all registered channels once per day at 01:00 AM, before the stats refresh at 02:15. */
    @Scheduled(cron = "0 0 1 * * *")
    public void scrapeAllChannels() {
        try {
            channelService.scrapeAllChannels();
        } catch (Exception e) {
            log.error("Scheduled channel scrape failed", e);
        }
    }
}
