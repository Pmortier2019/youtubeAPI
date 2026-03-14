package com.example.soundtracker.youtube;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ChannelResponse(List<Item> items) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(ContentDetails contentDetails) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ContentDetails(RelatedPlaylists relatedPlaylists) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record RelatedPlaylists(String uploads) {}
}
