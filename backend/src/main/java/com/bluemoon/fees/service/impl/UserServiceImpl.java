package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.User;
import com.bluemoon.fees.repository.UserRepository;
import com.bluemoon.fees.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User save(User entity) {
        return userRepository.save(entity);
    }

    @Override
    public List<User> saveAll(List<User> entities) {
        return userRepository.saveAll(entities);
    }

    @Override
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public void delete(User entity) {
        userRepository.delete(entity);
    }

    @Override
    public boolean existsById(Long id) {
        return userRepository.existsById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public User createUser(User user) {
        if (existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return save(user);
    }

    @Override
    public User updateUser(Long id, User user) {
        User existingUser = findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!existingUser.getUsername().equals(user.getUsername()) && existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (!existingUser.getEmail().equals(user.getEmail()) && existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setFullName(user.getFullName());
        existingUser.setVaiTro(user.getRole());
        existingUser.setEnabled(user.isEnabled());

        return save(existingUser);
    }

    @Override
    public void changePassword(Long id, String oldPassword, String newPassword) {
        User user = findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        save(user);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isEnabled(),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
        );
    }

    @Override
    public User findAdminUser() {
        return userRepository.findByVaiTro("ADMIN")
                .orElseThrow(() -> new RuntimeException("No admin user found"));
    }
}