package com.example.soundtracker.api;

import com.example.soundtracker.service.StatsRefreshService;
import com.example.soundtracker.service.StatsService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsRefreshService refreshService;
    private final StatsService statsService;

    public StatsController(StatsRefreshService refreshService, StatsService statsService) {
        this.refreshService = refreshService;
        this.statsService = statsService;
    }

    /** Fetch fresh stats from YouTube and save today's snapshots. */
    @PostMapping("/refresh")
    public String refresh() {
        int created = refreshService.refreshToday();
        return "Created snapshots today: " + created;
    }

    /**
     * Latest view/like/comment counts for every tracked video.
     * Use this as the data source for a statistics overview page.
     */
    @GetMapping("/videos")
    public List<StatsService.VideoSummary> videos() {
        return statsService.videoSummaries();
    }

    /**
     * Full snapshot history for one video (oldest → newest).
     * Use this to draw a view-growth chart.
     */
    @GetMapping("/videos/{videoId}")
    public StatsService.VideoHistory videoHistory(@PathVariable String videoId) {
        try {
            return statsService.videoHistory(videoId);
        } catch (NoSuchElementException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    /**
     * Total views (from latest snapshots) grouped by creator, descending.
     */
    @GetMapping("/creators")
    public List<StatsService.CreatorSummary> creators() {
        return statsService.creatorSummaries();
    }
}