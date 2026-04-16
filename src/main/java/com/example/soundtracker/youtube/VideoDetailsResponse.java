package com.example.soundtracker.youtube;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record VideoDetailsResponse(List<Item> items) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(String id, Snippet snippet, ContentDetails contentDetails) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Snippet(String title, String publishedAt) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ContentDetails(String duration) {}
}
