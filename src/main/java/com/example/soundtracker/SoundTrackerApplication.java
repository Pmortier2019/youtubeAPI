package com.example.soundtracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SoundTrackerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SoundTrackerApplication.class, args);
    }
}