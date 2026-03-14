package com.example.soundtracker.service;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.YoutubeChannel;
import com.example.soundtracker.repo.YoutubeChannelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class YoutubeChannelService {

    private final YoutubeChannelRepository channelRepository;
    private final ChannelScraperService channelScraperService;

    public YoutubeChannelService(YoutubeChannelRepository channelRepository,
                                 ChannelScraperService channelScraperService) {
        this.channelRepository = channelRepository;
        this.channelScraperService = channelScraperService;
    }

    /**
     * Resolves the channel from the given input (URL/handle/ID), saves it,
     * and triggers an initial scrape. Returns the saved channel.
     */
    @Transactional
    public YoutubeChannel addChannel(AppUser user, String channelInput) throws Exception {
        Map<String, String> info = channelScraperService.resolveChannelInfo(channelInput);
        String channelId = info.get("channelId");

        // Check if this channel is already linked to this account
        if (channelRepository.existsByAppUserIdAndChannelId(user.getId(), channelId)) {
            throw new IllegalArgumentException("This YouTube channel is already linked to your account.");
        }

        // Check if this channel is already linked to a different account
        if (channelRepository.existsByChannelId(channelId)) {
            throw new IllegalArgumentException("This YouTube channel is already linked to another SoundTracker account.");
        }

        YoutubeChannel channel = new YoutubeChannel(
                user,
                channelId,
                info.get("channelHandle"),
                info.get("channelName")
        );
        channel = channelRepository.save(channel);

        // Initial scrape
        try {
            channelScraperService.scrapeChannelShorts(channel);
        } catch (Exception e) {
            // Log but do not fail the registration
            System.err.println("Initial scrape failed for channel " + channelId + ": " + e.getMessage());
        }

        return channel;
    }

    /**
     * Lists all channels belonging to the given user.
     */
    public List<YoutubeChannel> listChannels(Long userId) {
        return channelRepository.findByAppUserId(userId);
    }

    /**
     * Deletes a channel if it belongs to the given user.
     */
    @Transactional
    public void deleteChannel(Long channelId, Long userId) {
        YoutubeChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found: " + channelId));

        if (!channel.getAppUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to channel: " + channelId);
        }

        channelRepository.delete(channel);
    }

    /**
     * Manually re-scrapes a channel belonging to the given user.
     * Returns count of new Shorts added.
     */
    @Transactional
    public int scrapeChannel(Long channelId, Long userId) throws Exception {
        YoutubeChannel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found: " + channelId));

        if (!channel.getAppUser().getId().equals(userId)) {
            throw new SecurityException("Access denied to channel: " + channelId);
        }

        return channelScraperService.scrapeChannelShorts(channel);
    }

    /**
     * Scrapes all registered channels. Called by the scheduler.
     */
    public void scrapeAllChannels() {
        channelScraperService.scrapeAllChannels();
    }
}
