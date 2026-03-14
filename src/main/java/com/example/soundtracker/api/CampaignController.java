package com.example.soundtracker.api;

import com.example.soundtracker.domain.Campaign;
import com.example.soundtracker.domain.CampaignStatus;
import com.example.soundtracker.service.CampaignService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    public List<Campaign> listAll() {
        return campaignService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Campaign createCampaign(@RequestBody CreateCampaignRequest req) {
        return campaignService.createCampaign(req);
    }

    @PatchMapping("/{id}/status")
    public Campaign updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        CampaignStatus status = CampaignStatus.valueOf(body.get("status"));
        return campaignService.updateStatus(id, status);
    }

    @GetMapping("/active")
    public List<Campaign> listActive() {
        return campaignService.listActive();
    }
}
