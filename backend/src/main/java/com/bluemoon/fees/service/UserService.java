package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import java.util.Optional;

public interface UserService extends BaseService<User, Long>, UserDetailsService {
    Optional<User> findByUsername(String username);
    User createUser(User user);
    User updateUser(Long id, User user);
    void changePassword(Long id, String oldPassword, String newPassword);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    User findAdminUser();
} 