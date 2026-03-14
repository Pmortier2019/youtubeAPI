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

    public PaymentMethodService(PaymentMethodRepository paymentMethodRepo) {
        this.paymentMethodRepo = paymentMethodRepo;
    }

    public List<PaymentMethod> list(Long userId) {
        return paymentMethodRepo.findByAppUserId(userId);
    }

    @Transactional
    public PaymentMethod add(Long userId, AddPaymentMethodRequest req, AppUser user) {
        PaymentMethod paymentMethod = new PaymentMethod(
                user,
                req.type(),
                req.details(),
                req.isDefault()
        );
        return paymentMethodRepo.save(paymentMethod);
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
