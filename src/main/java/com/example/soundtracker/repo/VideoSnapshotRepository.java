package com.example.soundtracker.repo;

import com.example.soundtracker.domain.VideoSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface VideoSnapshotRepository extends JpaRepository<VideoSnapshot, Long> {
    Optional<VideoSnapshot> findTopByVideoIdAndSnapshotDateOrderByIdDesc(String videoId, LocalDate snapshotDate);

    Optional<VideoSnapshot> findTopByVideoIdOrderBySnapshotDateDesc(String videoId);

    List<VideoSnapshot> findByVideoIdOrderBySnapshotDateAsc(String videoId);

    @Query("""
            SELECT v FROM VideoSnapshot v
            WHERE v.snapshotDate = (
                SELECT MAX(v2.snapshotDate) FROM VideoSnapshot v2 WHERE v2.videoId = v.videoId
            )
            """)
    List<VideoSnapshot> findLatestPerVideo();

    @Query("""
SELECT SUM(v.viewCount)
FROM VideoSnapshot v
JOIN ShortVideo s ON s.videoId = v.videoId
WHERE s.creator = :creator
""")
    Long sumViewsByCreator(String creator);
}