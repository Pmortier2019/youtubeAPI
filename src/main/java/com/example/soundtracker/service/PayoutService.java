package com.example.soundtracker.service;

import com.example.soundtracker.api.RequestPayoutRequest;
import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.Payout;
import com.example.soundtracker.domain.PayoutStatus;
import com.example.soundtracker.repo.PayoutRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PayoutService {

    private final PayoutRepository payoutRepo;
    private final EarningsService earningsService;

    public PayoutService(PayoutRepository payoutRepo, EarningsService earningsService) {
        this.payoutRepo = payoutRepo;
        this.earningsService = earningsService;
    }

    private static final BigDecimal MINIMUM_PAYOUT = new BigDecimal("39.00");

    @Transactional
    public Payout requestPayout(AppUser user, RequestPayoutRequest req) {
        EarningsService.EarningsSummary summary = earningsService.getEarnings(user);
        BigDecimal pending = summary.pendingPayout();
        if (pending.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("No pending payout available");
        }
        if (pending.compareTo(MINIMUM_PAYOUT) < 0) {
            throw new IllegalArgumentException(
                "Minimum payout amount is €39.00. Your current balance is €" +
                pending.setScale(2, java.math.RoundingMode.HALF_UP) + "."
            );
        }
        Payout payout = new Payout(
                user,
                pending,
                req.month(),
                req.year(),
                PayoutStatus.PENDING,
                req.paymentMethod(),
                req.paymentDetails()
        );
        return payoutRepo.save(payout);
    }

    public List<Payout> listAll() {
        return payoutRepo.findAll();
    }

    @Transactional
    public Payout markPaid(Long payoutId) {
        Payout payout = payoutRepo.findById(payoutId)
                .orElseThrow(() -> new NoSuchElementException("No payout with id: " + payoutId));
        payout.setStatus(PayoutStatus.PAID);
        payout.setPaidAt(Instant.now());
        return payoutRepo.save(payout);
    }
}
