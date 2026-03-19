package com.example.soundtracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.Nullable;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Nullable
    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender,
                        @Value("${spring.mail.from:noreply@soundtracker.com}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendVerificationEmail(String toEmail, String creatorName, String verificationLink) {
        if (mailSender == null) {
            log.warn("Mail not configured — skipping verification email to {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Verify your email - SoundTracker");
            message.setText(
                    "Hi " + creatorName + ",\n\n" +
                    "Welcome to SoundTracker! Please verify your email address by clicking the link below:\n\n" +
                    verificationLink + "\n\n" +
                    "This link expires in 24 hours.\n\n" +
                    "If you did not create an account, you can ignore this email.\n\n" +
                    "Best regards,\n" +
                    "The SoundTracker Team"
            );
            mailSender.send(message);
            log.info("Verification email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendPayoutNotification(String toEmail, String creatorName, BigDecimal amount) {
        if (mailSender == null) {
            log.warn("Mail not configured — skipping payout notification to {}", toEmail);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Your payout has been processed - SoundTracker");
            message.setText(
                    "Hi " + creatorName + ",\n\n" +
                    "Great news! Your payout of €" + String.format("%.2f", amount) + " has been processed.\n\n" +
                    "The amount will be transferred via your registered payment method. " +
                    "You can view the details in your SoundTracker account.\n\n" +
                    "Best regards,\n" +
                    "The SoundTracker Team"
            );
            mailSender.send(message);
            log.info("Payout notification sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send payout notification to {}: {}", toEmail, e.getMessage());
        }
    }
}
