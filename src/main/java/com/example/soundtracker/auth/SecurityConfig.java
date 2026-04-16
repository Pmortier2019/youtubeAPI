package com.example.soundtracker.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
public class SecurityConfig {

    private final AppUserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;
    private final AuthRateLimitFilter authRateLimitFilter;

    public SecurityConfig(AppUserDetailsService userDetailsService,
                          JwtAuthFilter jwtAuthFilter,
                          AuthRateLimitFilter authRateLimitFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
        this.authRateLimitFilter = authRateLimitFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/stats/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        // Shorts management is admin-only (creators access their shorts via /api/me/*)
                        .requestMatchers("/api/shorts/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/campaigns/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/campaigns/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/participations/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/sounds/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/sounds/**").hasRole("ADMIN")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll()
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(authRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        var provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
