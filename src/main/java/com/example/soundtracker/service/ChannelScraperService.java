package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.domain.YoutubeChannel;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.repo.YoutubeChannelRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ChannelScraperService {

    private static final Logger log = LoggerFactory.getLogger(ChannelScraperService.class);

    @Value("${youtube.apiKey}")
    private String apiKey;

    private static final String INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/browse";
    // params value for the Shorts tab
    private static final String SHORTS_PARAMS = "EgZzaG9ydHPyBgQKAhAB";

    private static final Pattern CHANNEL_ID_PATTERN = Pattern.compile("UC[A-Za-z0-9_-]{22}");
    private static final Pattern VIDEO_ID_PATTERN = Pattern.compile("\"videoId\":\"([A-Za-z0-9_-]{11})\"");
    private static final Pattern CHANNEL_NAME_PATTERN = Pattern.compile("\"title\":\\s*\"([^\"]+)\"");
    private static final Pattern CHANNEL_HANDLE_PATTERN = Pattern.compile("\"channelHandle\":\\s*\"(@[^\"]+)\"");

    private static final String USER_AGENT =
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final String COOKIES =
            "CONSENT=YES+cb.20210328-17-p0.en-US+FX+999; SOCS=CAISHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiA_LqmBg";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ShortVideoRepository shortVideoRepository;
    private final YoutubeChannelRepository channelRepository;

    public ChannelScraperService(ShortVideoRepository shortVideoRepository,
                                 YoutubeChannelRepository channelRepository) {
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();
        this.objectMapper = new ObjectMapper();
        this.shortVideoRepository = shortVideoRepository;
        this.channelRepository = channelRepository;
    }

    /**
     * Resolves a channel URL/handle/ID to a map containing channelId, channelHandle, channelName.
     * Accepts: UCxxxxx IDs, @handle, https://youtube.com/@handle, https://youtube.com/channel/UCxxxxx
     */
    public Map<String, String> resolveChannelInfo(String input) throws Exception {
        String trimmed = input.trim();

        // Build the URL to fetch
        String fetchUrl;
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            fetchUrl = trimmed;
        } else if (trimmed.startsWith("UC") && trimmed.length() >= 24) {
            fetchUrl = "https://www.youtube.com/channel/" + trimmed;
        } else if (trimmed.startsWith("@")) {
            fetchUrl = "https://www.youtube.com/" + trimmed;
        } else {
            // Try as handle without @
            fetchUrl = "https://www.youtube.com/@" + trimmed;
        }

        String html = fetchPage(fetchUrl);

        Map<String, String> info = new HashMap<>();

        // Extract channelId
        Matcher idMatcher = CHANNEL_ID_PATTERN.matcher(html);
        if (idMatcher.find()) {
            info.put("channelId", idMatcher.group());
        } else {
            throw new RuntimeException("Could not resolve channelId from: " + input);
        }

        // Extract channelHandle
        Matcher handleMatcher = CHANNEL_HANDLE_PATTERN.matcher(html);
        if (handleMatcher.find()) {
            info.put("channelHandle", handleMatcher.group(1));
        } else {
            // Try to derive handle from URL
            if (fetchUrl.contains("/@")) {
                String handle = fetchUrl.substring(fetchUrl.indexOf("/@") + 1);
                // Remove any trailing path segments
                if (handle.contains("/")) {
                    handle = handle.substring(0, handle.indexOf("/"));
                }
                info.put("channelHandle", handle);
            } else {
                info.put("channelHandle", null);
            }
        }

        // Extract channelName - look for "og:title" meta or the first "title" in ytInitialData
        Pattern ogTitlePattern = Pattern.compile("<meta property=\"og:title\" content=\"([^\"]+)\"");
        Matcher ogMatcher = ogTitlePattern.matcher(html);
        if (ogMatcher.find()) {
            info.put("channelName", ogMatcher.group(1));
        } else {
            Matcher nameMatcher = CHANNEL_NAME_PATTERN.matcher(html);
            if (nameMatcher.find()) {
                info.put("channelName", nameMatcher.group(1));
            } else {
                info.put("channelName", null);
            }
        }

        return info;
    }

    /**
     * Scrapes Shorts from a channel and saves new ones to the ShortVideo table.
     * Returns count of newly added Shorts.
     */
    @Transactional
    public int scrapeChannelShorts(YoutubeChannel channel) throws Exception {
        return scrapeChannelShorts(channel, false);
    }

    /**
     * Scrapes Shorts from a channel. Pass {@code initialScrape=true} on first channel add
     * to look back 30 days so existing Shorts appear immediately. On re-scrapes, pass
     * {@code false} to limit to the last 5 days.
     */
    @Transactional
    public int scrapeChannelShorts(YoutubeChannel channel, boolean initialScrape) throws Exception {
        String channelId = channel.getChannelId();
        String creatorName = channel.getAppUser().getCreatorName() != null
                ? channel.getAppUser().getCreatorName()
                : channel.getAppUser().getEmail();

        Set<String> videoIds = browseChannelShorts(channelId);

        // Collect only videoIds not yet in the DB (prevents duplicates on re-scrape)
        List<String> newVideoIds = new ArrayList<>();
        for (String videoId : videoIds) {
            if (shortVideoRepository.findByVideoId(videoId).isEmpty()) {
                newVideoIds.add(videoId);
            }
        }

        // On initial channel add, look back 30 days so existing Shorts are captured.
        // On re-scrapes, only accept Shorts published in the last 5 days.
        int lookbackDays = initialScrape ? 30 : 5;
        LocalDateTime cutoff = LocalDateTime.now(ZoneOffset.UTC).minusDays(lookbackDays);
        List<String> filteredVideoIds = filterByPublishDate(newVideoIds, cutoff);

        int count = 0;
        for (String videoId : filteredVideoIds) {
            String url = "https://www.youtube.com/shorts/" + videoId;
            shortVideoRepository.save(new ShortVideo(url, videoId, creatorName, channel));
            count++;
        }

        channel.setLastScrapedAt(LocalDateTime.now());
        channelRepository.save(channel);

        return count;
    }

    /**
     * Filters a list of videoIds to only those published on or after {@code addedAt}.
     * Videos are queried in batches of 50 via the YouTube Data API v3.
     * If the API call fails or a video is not found in the response, it is included (fail open).
     */
    private List<String> filterByPublishDate(List<String> videoIds, LocalDateTime addedAt) {
        if (videoIds.isEmpty()) return videoIds;

        List<String> kept = new ArrayList<>();

        // Batch into groups of 50
        int batchSize = 50;
        for (int i = 0; i < videoIds.size(); i += batchSize) {
            List<String> batch = videoIds.subList(i, Math.min(i + batchSize, videoIds.size()));
            try {
                String ids = String.join(",", batch);
                String url = "https://www.googleapis.com/youtube/v3/videos?part=snippet&id="
                        + URLEncoder.encode(ids, StandardCharsets.UTF_8)
                        + "&key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Accept", "application/json")
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                int statusCode = response.statusCode();
                String json = response.body();

                if (statusCode != 200) {
                    log.error("YouTube Data API returned HTTP {} for publish-date filter. Response body: {}",
                            statusCode, json);
                    // Non-200 response — include the whole batch (fail open)
                    kept.addAll(batch);
                    continue;
                }

                // Build a map of videoId -> publishedAt from the response
                Map<String, LocalDateTime> publishDates = extractPublishDates(json);

                for (String videoId : batch) {
                    LocalDateTime publishedAt = publishDates.get(videoId);
                    if (publishedAt == null) {
                        // Not found in response — include it (fail open)
                        kept.add(videoId);
                    } else if (!publishedAt.isBefore(addedAt)) {
                        kept.add(videoId);
                    }
                    // else: published before channel was added — skip
                }
            } catch (Exception e) {
                // API call failed — include the whole batch (fail open)
                log.error("YouTube Data API call failed for publish-date filter", e);
                kept.addAll(batch);
            }
        }

        return kept;
    }

    /**
     * Parses the YouTube Data API v3 videos response and returns a map of videoId -> publishedAt (UTC).
     * Uses simple string matching to stay consistent with the rest of this service.
     */
    private Map<String, LocalDateTime> extractPublishDates(String json) {
        Map<String, LocalDateTime> result = new HashMap<>();

        // Pattern to find each item block's videoId and publishedAt.
        // The YouTube API response structure places videoId and publishedAt inside each item.
        Pattern itemPattern = Pattern.compile(
                "\"id\"\\s*:\\s*\"([A-Za-z0-9_-]{11})\"[\\s\\S]*?\"publishedAt\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = itemPattern.matcher(json);
        while (matcher.find()) {
            String videoId = matcher.group(1);
            String publishedAtStr = matcher.group(2);
            try {
                LocalDateTime publishedAt = Instant.parse(publishedAtStr)
                        .atZone(ZoneOffset.UTC)
                        .toLocalDateTime();
                result.put(videoId, publishedAt);
            } catch (Exception e) {
                // Unparseable date — leave out of map so the video is included (fail open)
            }
        }

        return result;
    }

    /**
     * Scrapes all registered channels.
     */
    @Transactional
    public void scrapeAllChannels() {
        List<YoutubeChannel> channels = channelRepository.findAll();
        for (YoutubeChannel channel : channels) {
            try {
                int added = scrapeChannelShorts(channel);
                log.info("Scraped channel {} ({}): {} new Shorts",
                        channel.getChannelName(), channel.getChannelId(), added);
            } catch (Exception e) {
                log.error("Failed to scrape channel {}", channel.getChannelId(), e);
            }
        }
    }

    private static final int MAX_PAGES = 10; // safety cap to avoid infinite loops

    private Set<String> browseChannelShorts(String channelId) throws Exception {
        Set<String> videoIds = new HashSet<>();
        ObjectNode context = buildInnertubeContext();

        // First page: browse by channelId + Shorts params
        ObjectNode firstBody = objectMapper.createObjectNode();
        firstBody.set("context", context);
        firstBody.put("browseId", channelId);
        firstBody.put("params", SHORTS_PARAMS);

        String continuationToken = fetchPageAndExtract(firstBody, videoIds);

        // Subsequent pages: follow continuation tokens
        int page = 1;
        while (continuationToken != null && page < MAX_PAGES) {
            ObjectNode contBody = objectMapper.createObjectNode();
            contBody.set("context", context);
            contBody.put("continuation", continuationToken);
            continuationToken = fetchPageAndExtract(contBody, videoIds);
            page++;
        }

        return videoIds;
    }

    private ObjectNode buildInnertubeContext() {
        ObjectNode context = objectMapper.createObjectNode();
        ObjectNode client = objectMapper.createObjectNode();
        client.put("clientName", "WEB");
        client.put("clientVersion", "2.20250101.00.00");
        client.put("hl", "en");
        client.put("gl", "US");
        context.set("client", client);
        return context;
    }

    /**
     * Posts the given body to the Innertube browse endpoint, extracts videoIds into the set,
     * and returns the next continuation token (or null if there are no more pages).
     */
    private String fetchPageAndExtract(ObjectNode body, Set<String> videoIds) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(INNERTUBE_URL))
                .header("Content-Type", "application/json")
                .header("User-Agent", USER_AGENT)
                .header("X-YouTube-Client-Name", "1")
                .header("X-YouTube-Client-Version", "2.20250101.00.00")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        String responseBody = response.body();
        log.debug("Innertube response status: {}, body length: {}, first 500 chars: {}",
                response.statusCode(), responseBody.length(),
                responseBody.substring(0, Math.min(500, responseBody.length())));

        try {
            JsonNode root = objectMapper.readTree(responseBody);
            int before = videoIds.size();
            extractVideoIds(root, videoIds);
            log.debug("extractVideoIds found {} new IDs (total so far: {})", videoIds.size() - before, videoIds.size());
            return extractContinuationToken(root);
        } catch (Exception e) {
            // Fall back to regex if JSON parsing fails — no continuation possible
            Matcher matcher = VIDEO_ID_PATTERN.matcher(responseBody);
            while (matcher.find()) {
                videoIds.add(matcher.group(1));
            }
            log.debug("JSON parse failed, regex fallback found {} IDs", videoIds.size());
            return null;
        }
    }

    /**
     * Recursively searches the JSON tree for a continuationCommand token.
     */
    private String extractContinuationToken(JsonNode node) {
        if (node == null) return null;
        if (node.isObject()) {
            JsonNode token = node.get("token");
            JsonNode command = node.get("continuationCommand");
            if (command != null && token == null) {
                token = command.get("token");
            }
            // Found a token next to a continuationCommand
            if (token != null && token.isTextual() && node.has("continuationCommand")) {
                return token.asText();
            }
            // Also handle: continuationCommand: { token: "..." }
            if (command != null && command.isObject()) {
                JsonNode cmdToken = command.get("token");
                if (cmdToken != null && cmdToken.isTextual()) {
                    return cmdToken.asText();
                }
            }
            for (Iterator<JsonNode> it = node.elements(); it.hasNext(); ) {
                String found = extractContinuationToken(it.next());
                if (found != null) return found;
            }
        } else if (node.isArray()) {
            for (JsonNode child : node) {
                String found = extractContinuationToken(child);
                if (found != null) return found;
            }
        }
        return null;
    }

    private void extractVideoIds(JsonNode node, Set<String> videoIds) {
        if (node == null) return;
        if (node.isObject()) {
            // Check if this is a reelItemRenderer or gridVideoRenderer
            JsonNode reelRenderer = node.get("reelItemRenderer");
            JsonNode gridRenderer = node.get("gridVideoRenderer");

            JsonNode target = reelRenderer != null ? reelRenderer :
                              (gridRenderer != null ? gridRenderer : null);

            if (target != null) {
                JsonNode vidNode = target.get("videoId");
                if (vidNode != null && vidNode.isTextual()) {
                    String vid = vidNode.asText();
                    if (vid.matches("[A-Za-z0-9_-]{11}")) {
                        videoIds.add(vid);
                    }
                }
            }

            // Also check direct videoId on any node
            JsonNode directVid = node.get("videoId");
            if (directVid != null && directVid.isTextual()) {
                String vid = directVid.asText();
                if (vid.matches("[A-Za-z0-9_-]{11}")) {
                    videoIds.add(vid);
                }
            }

            node.fields().forEachRemaining(entry -> extractVideoIds(entry.getValue(), videoIds));
        } else if (node.isArray()) {
            node.forEach(child -> extractVideoIds(child, videoIds));
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
