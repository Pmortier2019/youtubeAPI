package com.example.soundtracker.api;

import com.example.soundtracker.domain.PaymentMethod;
import com.example.soundtracker.service.EncryptionService;
import com.example.soundtracker.repo.PaymentMethodRepository;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin/payment-methods")
public class AdminPaymentController {

    private final PaymentMethodRepository paymentMethodRepo;
    private final EncryptionService encryptionService;

    public AdminPaymentController(PaymentMethodRepository paymentMethodRepo,
                                  EncryptionService encryptionService) {
        this.paymentMethodRepo = paymentMethodRepo;
        this.encryptionService = encryptionService;
    }

    @GetMapping
    public List<PaymentMethodDto> listAll() {
        return paymentMethodRepo.findAll().stream()
                .map(m -> new PaymentMethodDto(
                        m.getId(),
                        m.getAppUser().getId(),
                        m.getAppUser().getCreatorName(),
                        m.getAppUser().getEmail(),
                        m.getType(),
                        encryptionService.decrypt(m.getDetails()),
                        m.isDefault(),
                        m.getCreatedAt()
                ))
                .toList();
    }

    public record PaymentMethodDto(
            Long id,
            Long userId,
            String creatorName,
            String email,
            String type,
            String details,
            boolean isDefault,
            Instant createdAt
    ) {}
}
