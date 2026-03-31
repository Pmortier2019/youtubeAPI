package com.example.soundtracker.repo;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.CreatorAgreementAcceptance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CreatorAgreementAcceptanceRepository extends JpaRepository<CreatorAgreementAcceptance, Long> {
    Optional<CreatorAgreementAcceptance> findByUserAndAgreementVersion(AppUser user, String agreementVersion);
    boolean existsByUserAndAgreementVersion(AppUser user, String agreementVersion);
}
