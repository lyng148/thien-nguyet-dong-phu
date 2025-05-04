package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.TamTruTamVang;
import com.bluemoon.fees.entity.NhanKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TamTruTamVangRepository extends JpaRepository<TamTruTamVang, Long> {
    List<TamTruTamVang> findByTrangThai(TamTruTamVang.TrangThai trangThai);
    List<TamTruTamVang> findByNhanKhau(NhanKhau nhanKhau);
    
    // Fix for the nhanKhauId query - add a proper JPQL query
    @Query("SELECT t FROM TamTruTamVang t WHERE t.nhanKhau.id = :nhanKhauId")
    List<TamTruTamVang> findByNhanKhauId(@Param("nhanKhauId") Long nhanKhauId);
    
    List<TamTruTamVang> findByThoiGianBetween(LocalDate startDate, LocalDate endDate);
}