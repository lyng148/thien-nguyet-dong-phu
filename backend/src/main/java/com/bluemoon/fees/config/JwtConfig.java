package com.bluemoon.fees.config;

import com.bluemoon.fees.security.JwtAuthenticationFilter;
import com.bluemoon.fees.security.JwtService;
import com.bluemoon.fees.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class JwtConfig {
    private final JwtService jwtService;
    private final UserService userService;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService, userService);
    }
} 