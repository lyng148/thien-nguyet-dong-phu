package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.NhanKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NhanKhauRepository extends JpaRepository<NhanKhau, Long> {
    List<NhanKhau> findByHoTenContainingIgnoreCase(String hoTen);
    Optional<NhanKhau> findByCccd(String cccd);
    List<NhanKhau> findByNgaySinhBetween(LocalDate startDate, LocalDate endDate);
    List<NhanKhau> findByQuanHeVoiChuHo(String quanHeVoiChuHo);
    List<NhanKhau> findByHoKhau(HoKhau hoKhau);
    List<NhanKhau> findByHoKhauId(Long hoKhauId);
}