package com.example.soundtracker.api;

public record RequestPayoutRequest(
        int year,
        int month,
        String paymentMethod,
        String paymentDetails
) {}
