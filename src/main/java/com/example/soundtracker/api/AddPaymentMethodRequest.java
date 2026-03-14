package com.example.soundtracker.api;

public record AddPaymentMethodRequest(
        String type,
        String details,
        boolean isDefault
) {}
