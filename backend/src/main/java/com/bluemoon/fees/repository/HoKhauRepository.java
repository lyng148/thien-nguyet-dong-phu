package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.HoKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoKhauRepository extends JpaRepository<HoKhau, Long> {
    List<HoKhau> findByHoatDongTrue();
    Optional<HoKhau> findByIdAndHoatDongTrue(Long id);
    List<HoKhau> findByChuHoContainingIgnoreCase(String chuHo);
    List<HoKhau> findByAddressContainingIgnoreCase(String address);
    Optional<HoKhau> findBySoHoKhau(String soHoKhau);
}