package com.example.soundtracker.youtube;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class YouTubeApiClient {

    private final RestClient restClient;
    private final String apiKey;

    public YouTubeApiClient(
            RestClient.Builder builder,
            @Value("${youtube.baseUrl}") String baseUrl,
            @Value("${youtube.apiKey}") String apiKey
    ) {
        this.restClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public Map<String, VideoStats> fetchStats(List<String> videoIds) {
        if (videoIds == null || videoIds.isEmpty()) return Map.of();

        String ids = videoIds.stream().distinct().collect(Collectors.joining(","));

        VideosResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/videos")
                        .queryParam("part", "statistics")
                        .queryParam("id", ids)
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .body(VideosResponse.class);

        Map<String, VideoStats> out = new HashMap<>();
        if (response == null || response.items() == null) return out;

        for (VideosResponse.Item item : response.items()) {
            if (item == null || item.id() == null || item.statistics() == null) continue;
            long views = parseLongSafe(item.statistics().viewCount());
            long likes = parseLongSafe(item.statistics().likeCount());
            long comments = parseLongSafe(item.statistics().commentCount());
            out.put(item.id(), new VideoStats(views, likes, comments));
        }
        return out;
    }

    /**
     * Returns the uploads-playlist ID for the given @ handle (e.g. "@CreatorName").
     * Use this playlist to iterate all videos from a channel.
     */
    public String fetchUploadsPlaylistIdByHandle(String handle) {
        ChannelResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/channels")
                        .queryParam("part", "contentDetails")
                        .queryParam("forHandle", handle)
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .body(ChannelResponse.class);

        if (response == null || response.items() == null || response.items().isEmpty()) {
            throw new IllegalArgumentException("Channel not found for handle: " + handle);
        }
        return response.items().get(0).contentDetails().relatedPlaylists().uploads();
    }

    /**
     * Returns all video IDs in a playlist, paginating automatically.
     */
    public List<String> fetchAllVideoIdsFromPlaylist(String playlistId) {
        List<String> videoIds = new ArrayList<>();
        String pageToken = null;

        do {
            final String token = pageToken;
            PlaylistItemsResponse response = restClient.get()
                    .uri(uriBuilder -> {
                        var b = uriBuilder
                                .path("/playlistItems")
                                .queryParam("part", "contentDetails")
                                .queryParam("playlistId", playlistId)
                                .queryParam("maxResults", "50")
                                .queryParam("key", apiKey);
                        if (token != null) b.queryParam("pageToken", token);
                        return b.build();
                    })
                    .retrieve()
                    .body(PlaylistItemsResponse.class);

            if (response == null || response.items() == null) break;
            response.items().forEach(item -> videoIds.add(item.contentDetails().videoId()));
            pageToken = response.nextPageToken();
        } while (pageToken != null);

        return videoIds;
    }

    /**
     * Returns details (title + duration) for the given video IDs.
     * Used to filter Shorts (duration <= 60 seconds).
     */
    public Map<String, VideoDetail> fetchVideoDetails(List<String> videoIds) {
        if (videoIds == null || videoIds.isEmpty()) return Map.of();

        String ids = videoIds.stream().distinct().collect(Collectors.joining(","));

        VideoDetailsResponse response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/videos")
                        .queryParam("part", "snippet,contentDetails")
                        .queryParam("id", ids)
                        .queryParam("key", apiKey)
                        .build())
                .retrieve()
                .body(VideoDetailsResponse.class);

        Map<String, VideoDetail> out = new HashMap<>();
        if (response == null || response.items() == null) return out;

        for (VideoDetailsResponse.Item item : response.items()) {
            if (item == null || item.id() == null) continue;
            String title = item.snippet() != null ? item.snippet().title() : "";
            String publishedAt = item.snippet() != null ? item.snippet().publishedAt() : null;
            long seconds = parseDurationSeconds(item.contentDetails() != null ? item.contentDetails().duration() : null);
            out.put(item.id(), new VideoDetail(title, seconds, publishedAt));
        }
        return out;
    }

    private long parseDurationSeconds(String isoDuration) {
        if (isoDuration == null) return 0L;
        try {
            return Duration.parse(isoDuration).getSeconds();
        } catch (Exception e) {
            return 0L;
        }
    }

    private long parseLongSafe(String s) {
        if (s == null) return 0L;
        try { return Long.parseLong(s); } catch (Exception e) { return 0L; }
    }

    /**
     * Returns the uploads-playlist ID for the given channel ID (UC...).
     * Converts UC -> UU directly without an extra API call.
     */
    public String fetchUploadsPlaylistIdByChannelId(String channelId) {
        if (channelId == null || !channelId.startsWith("UC")) {
            throw new IllegalArgumentException("Invalid channel ID: " + channelId);
        }
        return "UU" + channelId.substring(2);
    }

    public record VideoStats(long views, long likes, long comments) {}
    public record VideoDetail(String title, long durationSeconds, String publishedAt) {}
}