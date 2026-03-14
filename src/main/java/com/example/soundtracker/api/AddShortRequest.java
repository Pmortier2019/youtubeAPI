package com.example.soundtracker.api;

import jakarta.validation.constraints.NotBlank;

public record AddShortRequest(
        @NotBlank String url,
        @NotBlank String creator
) {}