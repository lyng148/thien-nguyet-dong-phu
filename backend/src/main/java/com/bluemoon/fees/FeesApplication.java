package com.bluemoon.fees;

import com.bluemoon.fees.entity.User;
import com.bluemoon.fees.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class FeesApplication {
    public static void main(String[] args) {
        SpringApplication.run(FeesApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner initializeUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                System.out.println("No users found, creating default admin user...");

                User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .vaiTro("ADMIN")
                    .email("admin@example.com")
                    .fullName("Administrator")
                    .enabled(true)
                    .build();

                User regularUser = User.builder()
                    .username("user")
                    .password(passwordEncoder.encode("user123"))
                    .vaiTro("USER")
                    .email("user@example.com")
                    .fullName("Regular User")
                    .enabled(true)
                    .build();

                User accountantUser = User.builder()
                        .username("ketoan")
                        .password(passwordEncoder.encode("123"))
                        .vaiTro("KE_TOAN")
                        .email("accountant@example.com")
                        .enabled(true)
                        .build();

                User toTruongUser = User.builder()
                        .username("totruong")
                        .password(passwordEncoder.encode("123"))
                        .vaiTro("TO_TRUONG")
                        .email("totruong@example.com")
                        .enabled(true)
                        .build();

                userRepository.save(adminUser);
                userRepository.save(regularUser);
                userRepository.save(accountantUser);
                userRepository.save(toTruongUser);

                System.out.println("Default users created successfully!");
            } else {
                System.out.println("Users already exist, skipping initialization.");
            }
        };
    }
} 