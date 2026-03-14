package com.example.soundtracker.youtube;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record VideosResponse(List<Item> items) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(String id, Statistics statistics) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Statistics(String viewCount, String likeCount, String commentCount) {}
}