package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.Payout;
import com.example.soundtracker.service.PoolPayoutService;
import com.example.soundtracker.service.PayoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PayoutController {

    private final PayoutService payoutService;
    private final PoolPayoutService poolPayoutService;

    public PayoutController(PayoutService payoutService, PoolPayoutService poolPayoutService) {
        this.payoutService = payoutService;
        this.poolPayoutService = poolPayoutService;
    }

    @PostMapping("/me/payout/request")
    @ResponseStatus(HttpStatus.CREATED)
    public Payout requestPayout(
            @RequestBody RequestPayoutRequest req,
            @AuthenticationPrincipal AppUser user
    ) {
        return payoutService.requestPayout(user, req);
    }

    @GetMapping("/payouts")
    public List<Payout> listAll() {
        return payoutService.listAll();
    }

    @PatchMapping("/payouts/{id}/paid")
    public Payout markPaid(@PathVariable Long id) {
        return payoutService.markPaid(id);
    }

    // --- Pool payout endpoints (admin only via SecurityConfig .anyRequest().hasRole("ADMIN")) ---

    @GetMapping("/admin/payout/preview")
    public List<PoolPayoutService.PayoutLineDto> previewPayout(@RequestParam double pot) {
        return poolPayoutService.previewPayout(pot);
    }

    @PostMapping("/admin/payout/process")
    public List<PoolPayoutService.PayoutLineDto> processPayout(@RequestBody Map<String, Double> body) {
        double pot = body.get("pot");
        return poolPayoutService.processPayout(pot);
    }

    @GetMapping("/admin/payout/history")
    public List<Payout> payoutHistory() {
        return payoutService.listAll();
    }

    @PatchMapping("/admin/payout/{id}/paid")
    public ResponseEntity<Payout> markAdminPaid(@PathVariable Long id) {
        return ResponseEntity.ok(payoutService.markPaid(id));
    }
}
