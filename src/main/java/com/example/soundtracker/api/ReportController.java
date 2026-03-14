package com.example.soundtracker.api;

import com.example.soundtracker.service.PayoutCalculatorService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.YearMonth;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final PayoutCalculatorService payoutService;

    public ReportController(PayoutCalculatorService payoutService) {
        this.payoutService = payoutService;
    }

    @GetMapping("/payout")
    public PayoutCalculatorService.PayoutReport payout(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam BigDecimal pot
    ) {
        return payoutService.payout(YearMonth.of(year, month), pot);
    }
}