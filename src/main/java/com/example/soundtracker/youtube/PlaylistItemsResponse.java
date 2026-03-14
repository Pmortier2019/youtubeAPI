package com.example.soundtracker.youtube;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PlaylistItemsResponse(String nextPageToken, List<Item> items) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(ContentDetails contentDetails) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ContentDetails(String videoId) {}
}
