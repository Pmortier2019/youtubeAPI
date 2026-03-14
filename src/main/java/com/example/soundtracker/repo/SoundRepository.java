package com.example.soundtracker.repo;

import com.example.soundtracker.domain.Sound;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SoundRepository extends JpaRepository<Sound, Long> {
}
