package com.example.soundtracker.repo;

import com.example.soundtracker.domain.Payout;
import com.example.soundtracker.domain.PayoutStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayoutRepository extends JpaRepository<Payout, Long> {
    List<Payout> findByAppUserId(Long userId);
    List<Payout> findByAppUserIdAndStatus(Long userId, PayoutStatus status);
    List<Payout> findByStatus(PayoutStatus status);
    List<Payout> findByCreatorName(String name);
}
