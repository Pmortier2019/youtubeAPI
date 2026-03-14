package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.service.EarningsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class EarningsController {

    private final EarningsService earningsService;

    public EarningsController(EarningsService earningsService) {
        this.earningsService = earningsService;
    }

    @GetMapping("/earnings")
    public EarningsService.EarningsSummary getEarnings(@AuthenticationPrincipal AppUser user) {
        return earningsService.getEarnings(user);
    }
}
