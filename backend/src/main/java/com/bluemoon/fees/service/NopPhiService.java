package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.NopPhi;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface NopPhiService extends BaseService<NopPhi, Long> {
    List<NopPhi> findByHoKhau(Long hoKhauId);
    List<NopPhi> findByKhoanThu(Long khoanThuId);
    List<NopPhi> findByDateRange(LocalDate startDate, LocalDate endDate);
    List<NopPhi> findUnverifiedPayments();
    NopPhi findByHoKhauAndKhoanThu(Long hoKhauId, Long khoanThuId);
    List<NopPhi> findByHoKhauAndDateRange(Long hoKhauId, LocalDate startDate, LocalDate endDate);
    NopPhi createNopPhi(NopPhi nopPhi);
    NopPhi updateNopPhi(Long id, NopPhi nopPhi);
    void verifyNopPhi(Long id);
    void unverifyNopPhi(Long id);
    Double calculateTotalPaymentsByHoKhau(Long hoKhauId);
    Double calculateTotalPaymentsByKhoanThu(Long khoanThuId);
    Double calculateTotalPaymentsByDateRange(LocalDate startDate, LocalDate endDate);
    List<Map<String, Object>> getHouseholdsPaidForFee(Long khoanThuId);
}