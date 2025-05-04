package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.LichSuHoKhau;
import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.NhanKhau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichSuHoKhauRepository extends JpaRepository<LichSuHoKhau, Long> {
    List<LichSuHoKhau> findByHoKhau(HoKhau hoKhau);
    List<LichSuHoKhau> findByHoKhauId(Long hoKhauId);
    List<LichSuHoKhau> findByNhanKhau(NhanKhau nhanKhau);
    List<LichSuHoKhau> findByNhanKhauId(Long nhanKhauId);
    List<LichSuHoKhau> findByLoaiThayDoi(LichSuHoKhau.LoaiThayDoi loaiThayDoi);
    List<LichSuHoKhau> findByThoiGianBetween(LocalDate startDate, LocalDate endDate);
}