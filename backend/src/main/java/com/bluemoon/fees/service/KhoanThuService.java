package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.KhoanThu;
import java.time.LocalDate;
import java.util.List;

public interface KhoanThuService extends BaseService<KhoanThu, Long> {
    List<KhoanThu> findAllActive();
    KhoanThu findActiveById(Long id);
    List<KhoanThu> findByBatBuoc(Boolean batBuoc);
    List<KhoanThu> findByThoiHanRange(LocalDate startDate, LocalDate endDate);
    List<KhoanThu> findOverdueKhoanThu();
    KhoanThu createKhoanThu(KhoanThu khoanThu);
    KhoanThu updateKhoanThu(Long id, KhoanThu khoanThu);
    void deactivateKhoanThu(Long id);
    void activateKhoanThu(Long id);
}