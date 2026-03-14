package com.example.soundtracker.api;

import com.example.soundtracker.service.CreatorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creators")
public class CreatorController {

    private final CreatorService service;

    public CreatorController(CreatorService service) {
        this.service = service;
    }

    @GetMapping
    public List<String> list() {
        return service.listCreators();
    }

    @GetMapping("/{creator}/views")
    public CreatorViews getViews(@PathVariable String creator) {
        long views = service.totalViews(creator);
        return new CreatorViews(creator, views);
    }

    record CreatorViews(String creator, long totalViews) {}
}