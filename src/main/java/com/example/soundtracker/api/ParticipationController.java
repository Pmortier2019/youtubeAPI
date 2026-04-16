package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.CampaignParticipation;
import com.example.soundtracker.domain.ParticipationStatus;
import com.example.soundtracker.service.ParticipationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ParticipationController {

    private final ParticipationService participationService;

    public ParticipationController(ParticipationService participationService) {
        this.participationService = participationService;
    }

    @PostMapping("/campaigns/{id}/join")
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignParticipation joinCampaign(
            @PathVariable Long id,
            @RequestBody JoinCampaignRequest req,
            @AuthenticationPrincipal AppUser user
    ) {
        if (!user.isEmailVerified()) {
            throw new IllegalStateException("Email address not verified. Please verify your email before joining a campaign.");
        }
        return participationService.joinCampaign(id, user.getCreatorName(), req.url());
    }

    @GetMapping("/campaigns/{id}/participations")
    public List<CampaignParticipation> listByCampaign(@PathVariable Long id) {
        return participationService.listByCampaign(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/participations/{id}/status")
    public CampaignParticipation updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        ParticipationStatus status = ParticipationStatus.valueOf(body.get("status"));
        return participationService.updateStatus(id, status);
    }
}
