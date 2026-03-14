package com.example.soundtracker.service;

import com.example.soundtracker.domain.ShortVideo;
import com.example.soundtracker.repo.ShortVideoRepository;
import com.example.soundtracker.youtube.YouTubeApiClient;
import com.example.soundtracker.youtube.YouTubeApiClient.VideoDetail;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ChannelFetchService {

    private static final long MAX_SHORT_SECONDS = 60;

    private final YouTubeApiClient yt;
    private final ShortVideoRepository repo;

    public ChannelFetchService(YouTubeApiClient yt, ShortVideoRepository repo) {
        this.yt = yt;
        this.repo = repo;
    }

    /**
     * Fetches all Shorts (videos <= 60s) from the given YouTube @ handle
     * and saves new ones with soundUsed = null (pending review).
     *
     * @return number of newly saved Shorts
     */
    @Transactional
    public int fetchShortsForCreator(String handle, String creator) {
        String playlistId = yt.fetchUploadsPlaylistIdByHandle(handle);
        List<String> allVideoIds = yt.fetchAllVideoIdsFromPlaylist(playlistId);

        List<ShortVideo> toSave = new ArrayList<>();

        // Process in batches of 50 (YouTube API limit)
        for (int i = 0; i < allVideoIds.size(); i += 50) {
            List<String> batch = allVideoIds.subList(i, Math.min(i + 50, allVideoIds.size()));
            Map<String, VideoDetail> details = yt.fetchVideoDetails(batch);

            for (Map.Entry<String, VideoDetail> entry : details.entrySet()) {
                String videoId = entry.getKey();
                VideoDetail detail = entry.getValue();

                if (detail.durationSeconds() > MAX_SHORT_SECONDS) continue;
                if (repo.findByVideoId(videoId).isPresent()) continue;

                String url = "https://www.youtube.com/shorts/" + videoId;
                toSave.add(new ShortVideo(url, videoId, creator));
            }
        }

        repo.saveAll(toSave);
        return toSave.size();
    }
}
