package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.domain.YoutubeChannel;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.repo.YoutubeChannelRepository;
import com.example.soundtracker.youtube.YouTubeApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChannelScraperService {

    private static final Logger log = LoggerFactory.getLogger(ChannelScraperService.class);

    private static final int MAX_DURATION_SECONDS = 60;
    private static final int LOOKBACK_DAYS = 5;
    private static final int INITIAL_LOOKBACK_DAYS = 30;

    private static final Pattern CHANNEL_ID_PATTERN = Pattern.compile("UC[A-Za-z0-9_-]{22}");
    private static final Pattern CHANNEL_HANDLE_PATTERN = Pattern.compile("\"channelHandle\":\\s*\"(@[^\"]+)\"");

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final String COOKIES =
            "CONSENT=YES+cb.20210328-17-p0.en-US+FX+999; SOCS=CAISHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiA_LqmBg";

    private final HttpClient httpClient;
    private final ShortVideoRepository shortVideoRepository;
    private final YoutubeChannelRepository channelRepository;
    private final YouTubeApiClient youTubeApiClient;

    public ChannelScraperService(ShortVideoRepository shortVideoRepository,
                                 YoutubeChannelRepository channelRepository,
                                 YouTubeApiClient youTubeApiClient) {
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();
        this.shortVideoRepository = shortVideoRepository;
        this.channelRepository = channelRepository;
        this.youTubeApiClient = youTubeApiClient;
    }

    /**
     * Resolves a channel URL/handle/ID to a map containing channelId, channelHandle, channelName.
     * Accepts: UCxxxxx IDs, @handle, https://youtube.com/@handle, https://youtube.com/channel/UCxxxxx
     */
    public Map<String, String> resolveChannelInfo(String input) throws Exception {
        String trimmed = input.trim();

        String fetchUrl;
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            fetchUrl = trimmed;
        } else if (trimmed.startsWith("UC") && trimmed.length() >= 24) {
            fetchUrl = "https://www.youtube.com/channel/" + trimmed;
        } else if (trimmed.startsWith("@")) {
            fetchUrl = "https://www.youtube.com/" + trimmed;
        } else {
            fetchUrl = "https://www.youtube.com/@" + trimmed;
        }

        String html = fetchPage(fetchUrl);

        Map<String, String> info = new HashMap<>();

        Matcher idMatcher = CHANNEL_ID_PATTERN.matcher(html);
        if (idMatcher.find()) {
            info.put("channelId", idMatcher.group());
        } else {
            throw new RuntimeException("Could not resolve channelId from: " + input);
        }

        Matcher handleMatcher = CHANNEL_HANDLE_PATTERN.matcher(html);
        if (handleMatcher.find()) {
            info.put("channelHandle", handleMatcher.group(1));
        } else {
            if (fetchUrl.contains("/@")) {
                String handle = fetchUrl.substring(fetchUrl.indexOf("/@") + 1);
                if (handle.contains("/")) handle = handle.substring(0, handle.indexOf("/"));
                info.put("channelHandle", handle);
            } else {
                info.put("channelHandle", null);
            }
        }

        Pattern ogTitlePattern = Pattern.compile("<meta property=\"og:title\" content=\"([^\"]+)\"");
        Matcher ogMatcher = ogTitlePattern.matcher(html);
        if (ogMatcher.find()) {
            info.put("channelName", ogMatcher.group(1));
        } else {
            info.put("channelName", null);
        }

        return info;
    }

    /**
     * Scrapes Shorts from a channel via the official YouTube Data API v3 and saves new ones.
     * Returns count of newly added Shorts.
     */
    @Transactional
    public int scrapeChannelShorts(YoutubeChannel channel) {
        return scrapeChannelShorts(channel, false);
    }

    /**
     * Scrapes Shorts from a channel. Pass {@code initialScrape=true} on first channel add
     * to look back 30 days so existing Shorts appear immediately. On re-scrapes, pass
     * {@code false} to limit to the last 5 days.
     */
    @Transactional
    public int scrapeChannelShorts(YoutubeChannel channel, boolean initialScrape) {
        String channelId = channel.getChannelId();
        String creatorName = channel.getAppUser().getCreatorName() != null
                ? channel.getAppUser().getCreatorName()
                : channel.getAppUser().getEmail();

        try {
            // Step 1: get uploads playlist ID (UC... -> UU...)
            String playlistId = youTubeApiClient.fetchUploadsPlaylistIdByChannelId(channelId);

            // Step 2: get all video IDs from the playlist
            List<String> allVideoIds = youTubeApiClient.fetchAllVideoIdsFromPlaylist(playlistId);
            log.debug("Channel {}: {} total videos in uploads playlist", channelId, allVideoIds.size());

            // Step 3: filter out video IDs already in the DB
            List<String> newVideoIds = allVideoIds.stream()
                    .filter(id -> shortVideoRepository.findByVideoId(id).isEmpty())
                    .toList();
            log.debug("Channel {}: {} new video IDs (not yet in DB)", channelId, newVideoIds.size());

            if (newVideoIds.isEmpty()) {
                channel.setLastScrapedAt(LocalDateTime.now());
                channelRepository.save(channel);
                return 0;
            }

            // Step 4: fetch details (title, duration, publishedAt) in batches of 50
            Map<String, YouTubeApiClient.VideoDetail> details = youTubeApiClient.fetchVideoDetails(newVideoIds);

            // On initial channel add, look back 30 days so existing Shorts are captured.
            // On re-scrapes, only accept Shorts published in the last 5 days.
            int lookbackDays = initialScrape ? INITIAL_LOOKBACK_DAYS : LOOKBACK_DAYS;
            LocalDateTime cutoff = LocalDateTime.now(ZoneOffset.UTC).minusDays(lookbackDays);

            int count = 0;
            for (String videoId : newVideoIds) {
                YouTubeApiClient.VideoDetail detail = details.get(videoId);
                if (detail == null) continue;

                if (detail.durationSeconds() > MAX_DURATION_SECONDS) continue;

                if (detail.publishedAt() != null) {
                    try {
                        LocalDateTime publishedAt = Instant.parse(detail.publishedAt())
                                .atZone(ZoneOffset.UTC)
                                .toLocalDateTime();
                        if (publishedAt.isBefore(cutoff)) continue;
                    } catch (Exception e) {
                        log.warn("Could not parse publishedAt '{}' for video {}", detail.publishedAt(), videoId);
                    }
                }

                String url = "https://www.youtube.com/shorts/" + videoId;
                shortVideoRepository.save(new ShortVideo(url, videoId, creatorName, channel));
                count++;
            }

            log.info("Scraped channel {} ({}): {} new Shorts added", channel.getChannelName(), channelId, count);
            channel.setLastScrapedAt(LocalDateTime.now());
            channelRepository.save(channel);
            return count;

        } catch (Exception e) {
            log.error("Failed to scrape channel {}", channelId, e);
            return 0;
        }
    }

    /**
     * Scrapes all registered channels.
     */
    public void scrapeAllChannels() {
        List<YoutubeChannel> channels = channelRepository.findAll();
        for (YoutubeChannel channel : channels) {
            scrapeChannelShorts(channel);
        }
    }

    private String fetchPage(String url) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", USER_AGENT)
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Encoding", "identity")
                .header("Cookie", COOKIES)
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
