package com.example.soundtracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_URL = "https://api.resend.com/emails";

    private final RestTemplate restTemplate = new RestTemplate();
    private final String apiKey;
    private final String fromAddress;

    public EmailService(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${spring.mail.from:onboarding@resend.dev}") String fromAddress) {
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
    }

    public void sendVerificationEmail(String toEmail, String creatorName, String verificationLink) {
        String html = "<p>Hi " + creatorName + ",</p>" +
                "<p>Welcome to PierreMusic! Please verify your email address by clicking the link below:</p>" +
                "<p><a href=\"" + verificationLink + "\">Verify my email</a></p>" +
                "<p>This link expires in 24 hours.</p>" +
                "<p>If you did not create an account, you can ignore this email.</p>" +
                "<p>Best regards,<br>The PierreMusic Team</p>";

        send(toEmail, "Verify your email - PierreMusic", html);
    }

    public void sendPayoutNotification(String toEmail, String creatorName, BigDecimal amount) {
        String html = "<p>Hi " + creatorName + ",</p>" +
                "<p>Great news! Your payout of <strong>€" + String.format("%.2f", amount) + "</strong> has been processed.</p>" +
                "<p>The amount will be transferred via your registered payment method.</p>" +
                "<p>Best regards,<br>The PierreMusic Team</p>";

        send(toEmail, "Your payout has been processed - PierreMusic", html);
    }

    private void send(String toEmail, String subject, String html) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Resend API key not configured — skipping email to {}", toEmail);
            return;
        }
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "from", fromAddress,
                    "to", List.of(toEmail),
                    "subject", subject,
                    "html", html
            );

            restTemplate.postForObject(RESEND_URL, new HttpEntity<>(body, headers), String.class);
            log.info("Email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }
}
