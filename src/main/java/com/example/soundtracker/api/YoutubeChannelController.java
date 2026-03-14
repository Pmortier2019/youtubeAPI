package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.YoutubeChannel;
import com.example.soundtracker.service.YoutubeChannelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

record ChannelDto(
        Long id,
        String channelId,
        String channelHandle,
        String channelName,
        java.time.LocalDateTime addedAt,
        java.time.LocalDateTime lastScrapedAt
) {
    static ChannelDto from(YoutubeChannel c) {
        return new ChannelDto(c.getId(), c.getChannelId(), c.getChannelHandle(), c.getChannelName(), c.getAddedAt(), c.getLastScrapedAt());
    }
}

@RestController
@RequestMapping("/api/me/channels")
public class YoutubeChannelController {

    private final YoutubeChannelService channelService;

    public YoutubeChannelController(YoutubeChannelService channelService) {
        this.channelService = channelService;
    }

    /** List all channels registered by the current user. */
    @GetMapping
    public List<ChannelDto> listChannels(@AuthenticationPrincipal AppUser user) {
        return channelService.listChannels(user.getId()).stream()
                .map(ChannelDto::from)
                .toList();
    }

    /** Register a new channel. Body: {"channelInput": "https://youtube.com/@handle"} */
    @PostMapping
    public ResponseEntity<?> addChannel(
            @AuthenticationPrincipal AppUser user,
            @RequestBody Map<String, String> body
    ) {
        String channelInput = body.get("channelInput");
        if (channelInput == null || channelInput.isBlank()) {
            return ResponseEntity.badRequest().body("channelInput is required");
        }
        try {
            YoutubeChannel channel = channelService.addChannel(user, channelInput);
            return ResponseEntity.status(HttpStatus.CREATED).body(ChannelDto.from(channel));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to add channel: " + e.getMessage());
        }
    }

    /** Remove a channel registered by the current user. */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteChannel(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id
    ) {
        try {
            channelService.deleteChannel(id, user.getId());
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }

    /** Manually trigger a re-scrape of a channel. */
    @PostMapping("/{id}/scrape")
    public ResponseEntity<?> scrapeChannel(
            @AuthenticationPrincipal AppUser user,
            @PathVariable Long id
    ) {
        try {
            int added = channelService.scrapeChannel(id, user.getId());
            return ResponseEntity.ok(Map.of("newShortsAdded", added));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Scrape failed: " + e.getMessage());
        }
    }
}
