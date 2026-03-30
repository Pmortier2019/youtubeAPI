package com.example.soundtracker.api;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.service.ChannelFetchService;
import com.example.soundtracker.service.ShortService;
import com.example.soundtracker.service.SoundScrapeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shorts")
public class ShortController {

    private final ShortService service;
    private final ChannelFetchService channelFetchService;
    private final SoundScrapeService soundScrapeService;

    public ShortController(ShortService service, ChannelFetchService channelFetchService, SoundScrapeService soundScrapeService) {
        this.service = service;
        this.channelFetchService = channelFetchService;
        this.soundScrapeService = soundScrapeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShortVideo add(@Valid @RequestBody AddShortRequest req) {
        return service.addShort(req.url(), req.creator());
    }

    @GetMapping
    public List<ShortVideo> list() {
        return service.list();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    /**
     * Fetch all Shorts from a YouTube channel and save them as pending review.
     * Body: { "channelId": "UCxxxx", "creator": "naam" }
     */
    @PostMapping("/fetch-channel")
    public Map<String, Object> fetchChannel(@Valid @RequestBody FetchChannelRequest req) {
        int count = channelFetchService.fetchShortsForCreator(req.handle(), req.creator());
        return Map.of("newShortsFetched", count);
    }

    /**
     * Scrape all Shorts from YouTube's audio pivot page for a given sound video ID.
     * Body: { "soundVideoId": "nnW0krX0X3c", "creator": "naam" }
     */
    @PostMapping("/scrape-sound")
    public Map<String, Object> scrapeSound(@Valid @RequestBody ScrapeSoundRequest req) throws Exception {
        int count = soundScrapeService.scrapeAndSave(req.soundVideoId(), req.creator());
        return Map.of("newShortsFetched", count);
    }

    /**
     * All shorts that have not yet been reviewed (soundUsed is null).
     */
    @GetMapping("/pending")
    public List<ShortVideo> pending() {
        return service.findPending();
    }

    /**
     * Mark whether a short uses the sound.
     * Body: { "used": true } or { "used": false }
     */
    @PatchMapping("/{id}/sound-used")
    public ShortVideo markSoundUsed(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean used = Boolean.TRUE.equals(body.get("used"));
        return service.markSoundUsed(id, used);
    }
}