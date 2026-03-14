package com.example.soundtracker.repo;

import com.example.soundtracker.domain.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
    List<PaymentMethod> findByAppUserId(Long userId);
}
