package com.example.soundtracker.service;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.CreatorAgreementAcceptance;
import com.example.soundtracker.repo.CreatorAgreementAcceptanceRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class AgreementService {

    public static final String CURRENT_AGREEMENT_VERSION = "1.0";

    public static final int MIN_PAYOUT_USD = 25;

    public static final String AGREEMENT_TITLE = "Creator Revenue Share Agreement";

    public static final String AGREEMENT_EFFECTIVE_DATE = "2026-03-31";

    public static final String AGREEMENT_BODY = """
### CREATOR REVENUE SHARE AGREEMENT

**Agreement Version:** 1.0
**Governing Entity:** PierreMusic (Netherlands)
**Last Updated:** 2026-03-31

---

**This Creator Revenue Share Agreement ("Agreement") is made between:**

* **Rights Holder:** PierreMusic, Netherlands
* **Creator:** You (the accepting party)

By clicking **"I Accept"**, you confirm that you have read, understood, and agree to be bound by the terms below.

---

#### 1. Purpose

You have created or will create video content using an audio track owned or distributed by PierreMusic. This Agreement defines how revenue generated from use of that audio track on social media platforms will be shared.

#### 2. Revenue Sources

Revenue may be generated from platforms including but not limited to TikTok, YouTube, and Instagram. Revenue is collected by PierreMusic through music distribution services (e.g. DistroKid or similar).

**Payment is only made after PierreMusic has actually received revenue from the distributor. If no revenue is received, no payment obligation exists.**

#### 3. Net Revenue Definition

"Net Revenue" means the amount actually received by PierreMusic after deductions for distributor fees, platform deductions, taxes, currency conversion fees, and payment processing fees.

#### 4. Revenue Distribution

From Net Revenue received:

* **70%** → Creator Pool (shared among all creators who used the sound)
* **30%** → PierreMusic

#### 5. Creator Share Calculation

Each creator receives a proportional share of the Creator Pool based on their views:

> **Creator Payment = (Your Views / Total Sound Views) × Creator Pool**

#### 6. Payment Conditions

Payments are made only when:

* PierreMusic has received revenue from the distributor
* View counts can be verified through platform analytics

PierreMusic reserves the right to determine total view counts based on available platform data, and **to exclude views suspected to be fraudulent, artificially generated, or produced through bots or manipulation.**

#### 7. Minimum Payout Threshold

Payments are only issued when your accumulated balance exceeds **$25 USD**. Balances below this amount roll over to the next payment period.

#### 8. Payment Timing

Payments are processed within **30 days** after PierreMusic receives revenue from the distributor.

#### 9. Ownership

* You retain ownership of your video content.
* PierreMusic retains ownership and control of the distributed audio track.
* This Agreement does not transfer audio track ownership to you.

#### 10. Limitation of Liability

PierreMusic is not responsible for platform policy changes, distributor policy changes, content removal, or fluctuations in advertising revenue. Revenue from social media platforms is not guaranteed.

#### 11. Termination

Either party may terminate this Agreement with **30 days written notice**. Revenue generated before termination will still be distributed per these terms.

#### 12. Taxes

Each party is responsible for their own applicable taxes.

#### 13. Governing Law

This Agreement is governed by the **laws of the Netherlands**.

---

*By clicking "I Accept" below, you confirm you understand and agree to the above terms. Your acceptance is recorded with a timestamp.*
""";

    private final CreatorAgreementAcceptanceRepository repo;

    public AgreementService(CreatorAgreementAcceptanceRepository repo) {
        this.repo = repo;
    }

    public record CurrentAgreementDto(
        String version,
        String title,
        String effectiveDate,
        String body,
        boolean hasAccepted
    ) {}

    public record AcceptAgreementDto(
        boolean accepted,
        Instant acceptedAt,
        String version
    ) {}

    public record AgreementStatusDto(
        boolean required,
        String version
    ) {}

    public CurrentAgreementDto getCurrent(AppUser user) {
        boolean hasAccepted = repo.existsByUserAndAgreementVersion(user, CURRENT_AGREEMENT_VERSION);
        return new CurrentAgreementDto(
            CURRENT_AGREEMENT_VERSION,
            AGREEMENT_TITLE,
            AGREEMENT_EFFECTIVE_DATE,
            AGREEMENT_BODY,
            hasAccepted
        );
    }

    public AcceptAgreementDto accept(AppUser user, String version, HttpServletRequest request) {
        if (!CURRENT_AGREEMENT_VERSION.equals(version)) {
            throw new IllegalArgumentException("Agreement version mismatch. Expected: " + CURRENT_AGREEMENT_VERSION);
        }

        Optional<CreatorAgreementAcceptance> existing = repo.findByUserAndAgreementVersion(user, version);
        if (existing.isPresent()) {
            CreatorAgreementAcceptance acc = existing.get();
            return new AcceptAgreementDto(true, acc.getAcceptedAt(), acc.getAgreementVersion());
        }

        String ip = extractClientIp(request);
        String userAgent = request.getHeader("User-Agent");

        CreatorAgreementAcceptance acceptance = new CreatorAgreementAcceptance(
            user, version, Instant.now(), ip, userAgent
        );
        repo.save(acceptance);

        return new AcceptAgreementDto(true, acceptance.getAcceptedAt(), acceptance.getAgreementVersion());
    }

    public AgreementStatusDto getStatus(AppUser user) {
        boolean hasAccepted = repo.existsByUserAndAgreementVersion(user, CURRENT_AGREEMENT_VERSION);
        return new AgreementStatusDto(!hasAccepted, CURRENT_AGREEMENT_VERSION);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
