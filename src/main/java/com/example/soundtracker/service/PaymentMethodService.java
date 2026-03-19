package com.example.soundtracker.service;

import com.example.soundtracker.api.AddPaymentMethodRequest;
import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.PaymentMethod;
import com.example.soundtracker.repo.PaymentMethodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepo;
    private final EncryptionService encryptionService;

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepo,
                                EncryptionService encryptionService) {
        this.paymentMethodRepo = paymentMethodRepo;
        this.encryptionService = encryptionService;
    }

    public List<PaymentMethod> list(Long userId) {
        List<PaymentMethod> methods = paymentMethodRepo.findByAppUserId(userId);
        methods.forEach(m -> m.setDetails(encryptionService.decrypt(m.getDetails())));
        return methods;
    }

    @Transactional
    public PaymentMethod add(Long userId, AddPaymentMethodRequest req, AppUser user) {
        PaymentMethod paymentMethod = new PaymentMethod(
                user,
                req.type(),
                encryptionService.encrypt(req.details()),
                req.isDefault()
        );
        PaymentMethod saved = paymentMethodRepo.save(paymentMethod);
        // Return with decrypted details so the response shows the original value
        saved.setDetails(req.details());
        return saved;
    }

    @Transactional
    public void delete(Long id, Long userId) {
        PaymentMethod paymentMethod = paymentMethodRepo.findById(id)
                .orElseThrow(() -> new NoSuchElementException("No payment method with id: " + id));
        if (!paymentMethod.getAppUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Payment method does not belong to this user");
        }
        paymentMethodRepo.deleteById(id);
    }
}
