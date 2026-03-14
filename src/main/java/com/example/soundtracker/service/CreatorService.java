package com.example.soundtracker.service;

import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.repo.VideoSnapshotRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CreatorService {

    private final VideoSnapshotRepository snapshotRepo;
    private final ShortVideoRepository shortRepo;

    public CreatorService(VideoSnapshotRepository snapshotRepo, ShortVideoRepository shortRepo) {
        this.snapshotRepo = snapshotRepo;
        this.shortRepo = shortRepo;
    }

    public long totalViews(String creator) {
        Long views = snapshotRepo.sumViewsByCreator(creator);
        return views == null ? 0 : views;
    }

    public List<String> listCreators() {
        return shortRepo.findDistinctCreators();
    }
}