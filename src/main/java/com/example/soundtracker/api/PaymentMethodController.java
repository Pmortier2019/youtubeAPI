package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.PaymentMethod;
import com.example.soundtracker.service.PaymentMethodService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/payment-methods")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    public PaymentMethodController(PaymentMethodService paymentMethodService) {
        this.paymentMethodService = paymentMethodService;
    }

    @GetMapping
    public List<PaymentMethod> list(@AuthenticationPrincipal AppUser user) {
        return paymentMethodService.list(user.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentMethod add(
            @RequestBody AddPaymentMethodRequest req,
            @AuthenticationPrincipal AppUser user
    ) {
        return paymentMethodService.add(user.getId(), req, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        paymentMethodService.delete(id, user.getId());
    }
}
