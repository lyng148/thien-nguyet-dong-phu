package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByVaiTro(String vaiTro);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}