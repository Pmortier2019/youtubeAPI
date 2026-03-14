package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.youtube.YouTubeVideoIdExtractor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class ShortService {

    private final ShortVideoRepository repo;

    public ShortService(ShortVideoRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public ShortVideo addShort(String url, String creator) {
        String videoId = YouTubeVideoIdExtractor.extract(url);

        repo.findByVideoId(videoId).ifPresent(existing -> {
            throw new IllegalArgumentException("This video is already registered: " + videoId);
        });

        return repo.save(new ShortVideo(url, videoId, creator));
    }

    public List<ShortVideo> list() {
        return repo.findAll();
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NoSuchElementException("No short video with id: " + id);
        }
        repo.deleteById(id);
    }

    /** All shorts that have not yet been reviewed (soundUsed is null). */
    public List<ShortVideo> findPending() {
        return repo.findBySoundUsedIsNull();
    }

    /** Mark whether a short uses the sound. */
    @Transactional
    public ShortVideo markSoundUsed(Long id, boolean used) {
        ShortVideo short_ = repo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No short video with id: " + id));
        short_.setSoundUsed(used);
        return repo.save(short_);
    }
}