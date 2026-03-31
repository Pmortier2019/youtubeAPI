package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.service.AgreementService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/agreements")
public class AgreementController {

    private final AgreementService agreementService;

    public AgreementController(AgreementService agreementService) {
        this.agreementService = agreementService;
    }

    @GetMapping("/current")
    public AgreementService.CurrentAgreementDto getCurrent(@AuthenticationPrincipal AppUser user) {
        return agreementService.getCurrent(user);
    }

    @PostMapping("/accept")
    public AgreementService.AcceptAgreementDto accept(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal AppUser user,
            HttpServletRequest request
    ) {
        String version = body.get("version");
        if (version == null || version.isBlank()) {
            throw new IllegalArgumentException("version is required");
        }
        return agreementService.accept(user, version, request);
    }

    @GetMapping("/status")
    public AgreementService.AgreementStatusDto getStatus(@AuthenticationPrincipal AppUser user) {
        return agreementService.getStatus(user);
    }
}
