package com.example.soundtracker.api;

import com.example.soundtracker.domain.Sound;
import com.example.soundtracker.repo.SoundRepository;
import com.example.soundtracker.youtube.YouTubeApiClient;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sounds")
public class SoundLibraryController {

    private final SoundRepository soundRepository;
    private final YouTubeApiClient youTubeApiClient;

    public SoundLibraryController(SoundRepository soundRepository, YouTubeApiClient youTubeApiClient) {
        this.soundRepository = soundRepository;
        this.youTubeApiClient = youTubeApiClient;
    }

    @GetMapping
    public List<Sound> listAll() {
        return soundRepository.findAll();
    }

    @GetMapping("/preview")
    public Map<String, String> preview(@RequestParam String videoId) {
        var details = youTubeApiClient.fetchVideoDetails(List.of(videoId));
        if (!details.containsKey(videoId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Video not found");
        }
        String title = details.get(videoId).title();
        return Map.of(
                "videoId", videoId,
                "title", title != null ? title : "",
                "thumbnailUrl", "https://img.youtube.com/vi/" + videoId + "/mqdefault.jpg"
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Sound create(@RequestBody CreateSoundRequest req) {
        Sound sound = new Sound(req.title(), req.artistName(), req.soundVideoId(), req.soundUrl(), req.genre());
        return soundRepository.save(sound);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!soundRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        soundRepository.deleteById(id);
    }

    public record CreateSoundRequest(
            String title,
            String artistName,
            String soundVideoId,
            String soundUrl,
            String genre
    ) {}
}
