package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.KhoanThu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface KhoanThuRepository extends JpaRepository<KhoanThu, Long> {
    List<KhoanThu> findByHoatDongTrue();
    Optional<KhoanThu> findByIdAndHoatDongTrue(Long id);
    List<KhoanThu> findByBatBuocAndHoatDongTrue(Boolean batBuoc);
    List<KhoanThu> findByThoiHanBetweenAndHoatDongTrue(LocalDate startDate, LocalDate endDate);
    List<KhoanThu> findByThoiHanBeforeAndHoatDongTrue(LocalDate date);
}