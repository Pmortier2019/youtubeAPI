package com.example.soundtracker.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "app_users")
public class AppUser implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Display name used for grouping stats and payouts. Null for ADMIN users. */
    @Column
    private String creatorName;

    protected AppUser() {}

    public AppUser(String email, String passwordHash, Role role, String creatorName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.creatorName = creatorName;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public String getCreatorName() { return creatorName; }

    // --- UserDetails ---

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() { return passwordHash; }

    @Override
    public String getUsername() { return email; }
}
