package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.NopPhi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NopPhiRepository extends JpaRepository<NopPhi, Long> {
    List<NopPhi> findByHoKhauId(Long hoKhauId);
    List<NopPhi> findByKhoanThuId(Long khoanThuId);
    List<NopPhi> findByNgayNopBetween(LocalDate startDate, LocalDate endDate);
    List<NopPhi> findByDaXacNhanFalse();
    Optional<NopPhi> findByHoKhauIdAndKhoanThuId(Long hoKhauId, Long khoanThuId);
    List<NopPhi> findByHoKhauIdAndNgayNopBetween(Long hoKhauId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT p FROM NopPhi p JOIN FETCH p.hoKhau JOIN FETCH p.khoanThu")
    List<NopPhi> findAllWithHoKhauAndKhoanThu();
    
    @Query("SELECT p FROM NopPhi p JOIN FETCH p.hoKhau JOIN FETCH p.khoanThu WHERE p.id = :id")
    Optional<NopPhi> findByIdWithHoKhauAndKhoanThu(Long id);
}