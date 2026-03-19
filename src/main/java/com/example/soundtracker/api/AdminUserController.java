package com.example.soundtracker.api;

import com.example.soundtracker.domain.AppUser;
import com.example.soundtracker.domain.Role;
import com.example.soundtracker.repo.AppUserRepository;
import com.example.soundtracker.repo.EmailVerificationTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AppUserRepository userRepo;
    private final EmailVerificationTokenRepository tokenRepo;

    public AdminUserController(AppUserRepository userRepo, EmailVerificationTokenRepository tokenRepo) {
        this.userRepo = userRepo;
        this.tokenRepo = tokenRepo;
    }

    @GetMapping
    public List<UserDto> listAll() {
        return userRepo.findAll().stream()
                .map(UserDto::from)
                .toList();
    }

    @PatchMapping("/{id}/role")
    public UserDto updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        try {
            Role role = Role.valueOf(body.get("role"));
            user.setRole(role);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role");
        }
        return UserDto.from(userRepo.save(user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void deleteUser(@PathVariable Long id) {
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        tokenRepo.deleteByUser(user);
        userRepo.delete(user);
    }

    public record UserDto(Long id, String email, String creatorName, String role, boolean emailVerified) {
        static UserDto from(AppUser u) {
            return new UserDto(u.getId(), u.getEmail(), u.getCreatorName(),
                    u.getRole().name(), u.isEmailVerified());
        }
    }
}
