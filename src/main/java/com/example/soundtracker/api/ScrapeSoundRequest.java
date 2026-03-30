package com.example.soundtracker.api;

import jakarta.validation.constraints.NotBlank;

public record ScrapeSoundRequest(
        @NotBlank String soundVideoId,
        @NotBlank String creator
) {}
