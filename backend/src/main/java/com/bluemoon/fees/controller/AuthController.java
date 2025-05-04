package com.bluemoon.fees.controller;

import com.bluemoon.fees.dto.AuthRequest;
import com.bluemoon.fees.dto.AuthResponse;
import com.bluemoon.fees.dto.RegisterRequest;
import com.bluemoon.fees.entity.User;
import com.bluemoon.fees.security.JwtService;
import com.bluemoon.fees.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userService.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getVaiTro()));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.createUser(User.builder()
            .username(request.getUsername())
            .password(request.getPassword())
            .email(request.getEmail())
            .fullName(request.getFullName())
            .vaiTro("USER")
            .enabled(true)
            .build());

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getVaiTro()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestParam Long userId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        userService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuth() {
        Map<String, Object> response = new HashMap<>();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            authentication.getPrincipal() instanceof UserDetails) {
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            
            response.put("authenticated", true);
            response.put("username", userDetails.getUsername());
            response.put("authorities", userDetails.getAuthorities().toString());
            
            try {
                User user = userService.findByUsername(userDetails.getUsername()).orElse(null);
                if (user != null) {
                    response.put("userId", user.getId());
                    response.put("role", user.getVaiTro()); // Updated to use vaiTro
                    response.put("email", user.getEmail());
                }
            } catch (Exception e) {
                response.put("userLookupError", e.getMessage());
            }
        } else {
            response.put("authenticated", false);
            response.put("principal", authentication != null ? authentication.getPrincipal().toString() : "null");
        }
        
        return ResponseEntity.ok(response);
    }
}