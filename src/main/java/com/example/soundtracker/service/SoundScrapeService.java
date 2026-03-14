package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.youtube.YouTubeVideoIdExtractor;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashSet;
import java.util.Set;

@Service
public class SoundScrapeService {

    private static final String INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
    private static final String INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/browse?key=" + INNERTUBE_KEY;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final ShortVideoRepository repo;

    public SoundScrapeService(ShortVideoRepository repo) {
        this.httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .build();
        this.objectMapper = new ObjectMapper();
        this.repo = repo;
    }

    public int scrapeAndSave(String input, String creator) throws Exception {
        // Accept full URLs or bare video IDs
        String soundVideoId = input.contains("youtube.com") || input.contains("youtu.be")
                ? YouTubeVideoIdExtractor.extract(input)
                : input.trim();

        // Step 1: Get the MPSP browseId from the video's watch page
        String mpspBrowseId = fetchMpspBrowseId(soundVideoId);

        // Step 2: Browse that sound ID to get all Shorts using it
        Set<String> videoIds = browseSound(mpspBrowseId);
        videoIds.remove(soundVideoId);

        // Step 3: Save new videos to DB
        int count = 0;
        for (String videoId : videoIds) {
            if (repo.findByVideoId(videoId).isEmpty()) {
                String videoUrl = "https://www.youtube.com/shorts/" + videoId;
                repo.save(new ShortVideo(videoUrl, videoId, creator));
                count++;
            }
        }
        return count;
    }

    private String fetchMpspBrowseId(String videoId) throws Exception {
        // Try the shorts URL first, then fall back to watch URL
        Set<String> mpspIds = fetchMpspFromUrl("https://www.youtube.com/shorts/" + videoId + "?hl=en&gl=US");
        if (mpspIds.isEmpty()) {
            mpspIds = fetchMpspFromUrl("https://www.youtube.com/watch?v=" + videoId + "&hl=en&gl=US");
        }
        if (mpspIds.isEmpty()) {
            throw new RuntimeException("No sound (MPSP ID) found for video " + videoId + ". Make sure this is a Short with a linked sound.");
        }
        return mpspIds.iterator().next();
    }

    private Set<String> fetchMpspFromUrl(String url) throws Exception {

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("Accept-Language", "en-US,en;q=0.9")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Accept-Encoding", "identity")
                .header("Cookie", "CONSENT=YES+cb.20210328-17-p0.en-US+FX+999; SOCS=CAISHAgBEhJnd3NfMjAyMzA4MTAtMF9SQzIaAmVuIAEaBgiA_LqmBg")
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        String html = response.body();

        String marker = "var ytInitialData = ";
        int start = html.indexOf(marker);
        if (start == -1) return new HashSet<>();

        start += marker.length();
        int end = html.indexOf(";</script>", start);
        if (end == -1) return new HashSet<>();

        String json = html.substring(start, end);
        JsonNode root = objectMapper.readTree(json);

        Set<String> mpspIds = new HashSet<>();
        extractMpspIds(root, mpspIds);
        return mpspIds;
    }

    private Set<String> browseSound(String browseId) throws Exception {
        // Build innertube request body
        ObjectNode context = objectMapper.createObjectNode();
        ObjectNode client = objectMapper.createObjectNode();
        client.put("clientName", "WEB");
        client.put("clientVersion", "2.20240101.01.00");
        client.put("hl", "en");
        client.put("gl", "US");
        context.set("client", client);

        ObjectNode body = objectMapper.createObjectNode();
        body.set("context", context);
        body.put("browseId", browseId);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(INNERTUBE_URL))
                .header("Content-Type", "application/json")
                .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
                .header("X-YouTube-Client-Name", "1")
                .header("X-YouTube-Client-Version", "2.20240101.01.00")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode root = objectMapper.readTree(response.body());

        Set<String> videoIds = new HashSet<>();
        extractVideoIds(root, videoIds);
        return videoIds;
    }

    private void extractMpspIds(JsonNode node, Set<String> mpspIds) {
        if (node == null) return;
        if (node.isObject()) {
            // Look for browseEndpoint with MPSP browseId
            JsonNode browseEndpoint = node.get("browseEndpoint");
            if (browseEndpoint != null) {
                JsonNode browseId = browseEndpoint.get("browseId");
                if (browseId != null && browseId.asText().startsWith("MPSP")) {
                    mpspIds.add(browseId.asText());
                }
            }
            node.fields().forEachRemaining(entry -> extractMpspIds(entry.getValue(), mpspIds));
        } else if (node.isArray()) {
            node.forEach(child -> extractMpspIds(child, mpspIds));
        }
    }

    private void extractVideoIds(JsonNode node, Set<String> videoIds) {
        if (node == null) return;
        if (node.isObject()) {
            JsonNode vidNode = node.get("videoId");
            if (vidNode != null && vidNode.isTextual()) {
                String vid = vidNode.asText();
                if (vid.matches("[a-zA-Z0-9_-]{11}")) {
                    videoIds.add(vid);
                }
            }
            node.fields().forEachRemaining(entry -> extractVideoIds(entry.getValue(), videoIds));
        } else if (node.isArray()) {
            node.forEach(child -> extractVideoIds(child, videoIds));
        }
    }
}
