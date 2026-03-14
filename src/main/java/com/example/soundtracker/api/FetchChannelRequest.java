package com.example.soundtracker.api;

import jakarta.validation.constraints.NotBlank;

public record FetchChannelRequest(
        @NotBlank String handle,
        @NotBlank String creator
) {}
