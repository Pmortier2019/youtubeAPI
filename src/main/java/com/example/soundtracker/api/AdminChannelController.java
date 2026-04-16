package com.example.soundtracker.api;

import com.example.soundtracker.domain.YoutubeChannel;
import com.example.soundtracker.repo.YoutubeChannelRepository;
import com.example.soundtracker.service.YoutubeChannelService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/channels")
public class AdminChannelController {

    private final YoutubeChannelRepository channelRepository;
    private final YoutubeChannelService channelService;

    public AdminChannelController(YoutubeChannelRepository channelRepository,
                                  YoutubeChannelService channelService) {
        this.channelRepository = channelRepository;
        this.channelService = channelService;
    }

    @GetMapping
    public Page<ChannelAdminDto> listAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        return channelRepository.findAll(PageRequest.of(page, size, Sort.by("addedAt").descending()))
                .map(ChannelAdminDto::from);
    }

    @PostMapping("/{id}/scrape")
    public ResponseEntity<?> scrape(@PathVariable Long id) {
        YoutubeChannel channel = channelRepository.findById(id).orElse(null);
        if (channel == null) return ResponseEntity.notFound().build();
        try {
            int added = channelService.scrapeChannelAsAdmin(id);
            return ResponseEntity.ok(Map.of("newShortsAdded", added));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Scrape failed: " + e.getMessage());
        }
    }

    record ChannelAdminDto(Long id, String channelId, String channelHandle, String channelName,
                           String creatorName, String creatorEmail,
                           LocalDateTime addedAt, LocalDateTime lastScrapedAt) {
        static ChannelAdminDto from(YoutubeChannel c) {
            return new ChannelAdminDto(
                    c.getId(), c.getChannelId(), c.getChannelHandle(), c.getChannelName(),
                    c.getAppUser().getCreatorName(), c.getAppUser().getEmail(),
                    c.getAddedAt(), c.getLastScrapedAt()
            );
        }
    }
}
