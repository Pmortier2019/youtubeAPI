package com.example.soundtracker.repo;

import com.example.soundtracker.domain.ShortVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ShortVideoRepository extends JpaRepository<ShortVideo, Long> {
    Optional<ShortVideo> findByVideoId(String videoId);

    @Query("SELECT DISTINCT s.creator FROM ShortVideo s ORDER BY s.creator")
    List<String> findDistinctCreators();

    List<ShortVideo> findBySoundUsedIsNull();

    List<ShortVideo> findBySoundUsedTrue();

    /** All shorts belonging to channels owned by the given user. */
    List<ShortVideo> findByChannelAppUserId(Long userId);

    /** All shorts belonging to a specific channel. */
    List<ShortVideo> findByChannelId(Long channelId);
}