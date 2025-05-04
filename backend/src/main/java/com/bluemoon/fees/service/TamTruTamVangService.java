package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.TamTruTamVang;
import com.bluemoon.fees.entity.NhanKhau;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TamTruTamVangService extends BaseService<TamTruTamVang, Long> {
    List<TamTruTamVang> findAll();
    Optional<TamTruTamVang> findById(Long id);
    List<TamTruTamVang> findByTrangThai(TamTruTamVang.TrangThai trangThai);
    List<TamTruTamVang> findByNhanKhau(NhanKhau nhanKhau);
    List<TamTruTamVang> findByNhanKhauId(Long nhanKhauId);
    List<TamTruTamVang> findByThoiGianRange(LocalDate startDate, LocalDate endDate);
    TamTruTamVang createTamTruTamVang(TamTruTamVang tamTruTamVang);
    TamTruTamVang updateTamTruTamVang(Long id, TamTruTamVang tamTruTamVang);
    void deleteTamTruTamVang(Long id);
}