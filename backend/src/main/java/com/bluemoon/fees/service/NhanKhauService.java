package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.NhanKhau;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NhanKhauService extends BaseService<NhanKhau, Long> {
    List<NhanKhau> findAll();
    Optional<NhanKhau> findById(Long id);
    List<NhanKhau> searchByHoTen(String hoTen);
    NhanKhau findByCccd(String cccd);
    List<NhanKhau> findByNgaySinhRange(LocalDate startDate, LocalDate endDate);
    List<NhanKhau> findByQuanHeVoiChuHo(String quanHeVoiChuHo);
    NhanKhau createNhanKhau(NhanKhau nhanKhau);
    NhanKhau updateNhanKhau(Long id, NhanKhau nhanKhau);
    void deleteNhanKhau(Long id);
}