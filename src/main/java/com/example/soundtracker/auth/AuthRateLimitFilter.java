package com.example.soundtracker.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for /api/auth/** endpoints.
 * Allows at most MAX_REQUESTS per IP within a WINDOW_SECONDS sliding window.
 * No external dependencies required.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_SECONDS = 60;

    private record WindowEntry(AtomicInteger count, long windowStart) {}

    private final ConcurrentHashMap<String, WindowEntry> ipWindows = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String ip = resolveClientIp(request);
        long now = Instant.now().getEpochSecond();

        WindowEntry entry = ipWindows.compute(ip, (key, existing) -> {
            if (existing == null || now - existing.windowStart() >= WINDOW_SECONDS) {
                return new WindowEntry(new AtomicInteger(1), now);
            }
            existing.count().incrementAndGet();
            return existing;
        });

        if (entry.count().get() > MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Take only the first IP in case of proxy chain
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
