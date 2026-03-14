package com.example.soundtracker.repo;

import com.example.soundtracker.domain.YoutubeChannel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface YoutubeChannelRepository extends JpaRepository<YoutubeChannel, Long> {
    List<YoutubeChannel> findByAppUserId(Long appUserId);
    boolean existsByAppUserIdAndChannelId(Long appUserId, String channelId);

    /** Check if this YouTube channel is already linked to ANY account. */
    boolean existsByChannelId(String channelId);

    /** Find which account already has this channel (for error messaging). */
    java.util.Optional<YoutubeChannel> findByChannelId(String channelId);
}
