package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.LichSuHoKhau;
import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.NhanKhau;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LichSuHoKhauService extends BaseService<LichSuHoKhau, Long> {
    List<LichSuHoKhau> findAll();
    Optional<LichSuHoKhau> findById(Long id);
    List<LichSuHoKhau> findByHoKhau(HoKhau hoKhau);
    List<LichSuHoKhau> findByHoKhauId(Long hoKhauId);
    List<LichSuHoKhau> findByNhanKhau(NhanKhau nhanKhau);
    List<LichSuHoKhau> findByNhanKhauId(Long nhanKhauId);
    List<LichSuHoKhau> findByLoaiThayDoi(LichSuHoKhau.LoaiThayDoi loaiThayDoi);
    List<LichSuHoKhau> findByThoiGianRange(LocalDate startDate, LocalDate endDate);
    LichSuHoKhau createLichSuHoKhau(LichSuHoKhau lichSuHoKhau);
    LichSuHoKhau updateLichSuHoKhau(Long id, LichSuHoKhau lichSuHoKhau);
    void deleteLichSuHoKhau(Long id);
    
    // Helper methods for entity references
    HoKhau getHoKhauReference(Long hoKhauId);
    NhanKhau getNhanKhauReference(Long nhanKhauId);
}