package com.bluemoon.fees.controller;

import com.bluemoon.fees.entity.User;
import com.bluemoon.fees.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, Object> roleMap) {
        // Check if we receive a string role directly
        if (roleMap.containsKey("role")) {
            String role = (String) roleMap.get("role");
            User user = userService.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
            
            // Validate role
            if (role.equals("ADMIN") || role.equals("USER") || 
                role.equals("TO_TRUONG") || role.equals("KE_TOAN")) {
                user.setVaiTro(role);
                userService.save(user);
                return ResponseEntity.ok().build();
            } else {
                throw new IllegalArgumentException("Invalid role: " + role);
            }
        }
        
        // Legacy support for isAdmin boolean
        boolean isAdmin = Boolean.TRUE.equals(roleMap.get("isAdmin"));
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setVaiTro(isAdmin ? "ADMIN" : "USER");
        userService.save(user);
        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> statusMap) {
        boolean enabled = statusMap.getOrDefault("enabled", false);
        User user = userService.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setEnabled(enabled);
        userService.save(user);
        
        return ResponseEntity.ok().build();
    }
}