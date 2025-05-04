package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.KhoanThu;
import com.bluemoon.fees.entity.NopPhi;
import com.bluemoon.fees.exception.ResourceNotFoundException;
import com.bluemoon.fees.repository.HoKhauRepository;
import com.bluemoon.fees.repository.KhoanThuRepository;
import com.bluemoon.fees.repository.NopPhiRepository;
import com.bluemoon.fees.service.NopPhiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class NopPhiServiceImpl implements NopPhiService {

    private final NopPhiRepository nopPhiRepository;
    private final HoKhauRepository hoKhauRepository;
    private final KhoanThuRepository khoanThuRepository;

    @Override
    public NopPhi save(NopPhi entity) {
        return nopPhiRepository.save(entity);
    }

    @Override
    public List<NopPhi> saveAll(List<NopPhi> entities) {
        return nopPhiRepository.saveAll(entities);
    }

    @Override
    public Optional<NopPhi> findById(Long id) {
        return nopPhiRepository.findByIdWithHoKhauAndKhoanThu(id);
    }

    @Override
    public List<NopPhi> findAll() {
        return nopPhiRepository.findAllWithHoKhauAndKhoanThu();
    }

    @Override
    public void deleteById(Long id) {
        nopPhiRepository.deleteById(id);
    }

    @Override
    public void delete(NopPhi entity) {
        nopPhiRepository.delete(entity);
    }

    @Override
    public boolean existsById(Long id) {
        return nopPhiRepository.existsById(id);
    }

    @Override
    public List<NopPhi> findByHoKhau(Long hoKhauId) {
        return nopPhiRepository.findByHoKhauId(hoKhauId);
    }

    @Override
    public List<NopPhi> findByKhoanThu(Long khoanThuId) {
        return nopPhiRepository.findByKhoanThuId(khoanThuId);
    }

    @Override
    public List<NopPhi> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return nopPhiRepository.findByNgayNopBetween(startDate, endDate);
    }

    @Override
    public List<NopPhi> findUnverifiedPayments() {
        return nopPhiRepository.findByDaXacNhanFalse();
    }

    @Override
    public NopPhi findByHoKhauAndKhoanThu(Long hoKhauId, Long khoanThuId) {
        return nopPhiRepository.findByHoKhauIdAndKhoanThuId(hoKhauId, khoanThuId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for household ID: " + hoKhauId + " and fee ID: " + khoanThuId));
    }

    @Override
    public List<NopPhi> findByHoKhauAndDateRange(Long hoKhauId, LocalDate startDate, LocalDate endDate) {
        return nopPhiRepository.findByHoKhauIdAndNgayNopBetween(hoKhauId, startDate, endDate);
    }

    @Override
    public NopPhi createNopPhi(NopPhi nopPhi) {
        // Fetch full entities
        HoKhau hoKhau = hoKhauRepository.findById(nopPhi.getHoKhau().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + nopPhi.getHoKhau().getId()));
        
        KhoanThu khoanThu = khoanThuRepository.findById(nopPhi.getKhoanThu().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with ID: " + nopPhi.getKhoanThu().getId()));
        
        // Set proper entity references
        nopPhi.setHoKhau(hoKhau);
        nopPhi.setKhoanThu(khoanThu);
        
        // Set default values if not provided
        if (nopPhi.getNgayNop() == null) {
            nopPhi.setNgayNop(LocalDate.now());
        }
        
        // Set tongTien based on KhoanThu if not provided
        if (nopPhi.getTongTien() == null || nopPhi.getTongTien() <= 0) {
            nopPhi.setTongTien(khoanThu.getSoTien());
        }
        
        return nopPhiRepository.save(nopPhi);
    }

    @Override
    public NopPhi updateNopPhi(Long id, NopPhi nopPhi) {
        NopPhi existingNopPhi = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        
        // Maintain important references
        nopPhi.setId(existingNopPhi.getId());
        
        // Update all necessary fields
        existingNopPhi.setNguoiNop(nopPhi.getNguoiNop());
        existingNopPhi.setNgayNop(nopPhi.getNgayNop());
        existingNopPhi.setSoTien(nopPhi.getSoTien());
        existingNopPhi.setTongTien(nopPhi.getTongTien());
        existingNopPhi.setGhiChu(nopPhi.getGhiChu());
        existingNopPhi.setDaXacNhan(nopPhi.isDaXacNhan());
        
        System.out.printf("Updating payment with ID: {} - nguoiNop: {}, ngayNop: {}, soTien: {}, tongTien: {}, daXacNhan: {}", 
                 id, nopPhi.getNguoiNop(), nopPhi.getNgayNop(), nopPhi.getSoTien(), nopPhi.getTongTien(), nopPhi.isDaXacNhan());
        
        return nopPhiRepository.save(existingNopPhi);
    }

    @Override
    public void verifyNopPhi(Long id) {
        NopPhi nopPhi = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        
        nopPhi.setDaXacNhan(true);
        nopPhiRepository.save(nopPhi);
    }

    @Override
    public void unverifyNopPhi(Long id) {
        NopPhi nopPhi = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        
        nopPhi.setDaXacNhan(false);
        nopPhiRepository.save(nopPhi);
    }

    @Override
    public Double calculateTotalPaymentsByHoKhau(Long hoKhauId) {
        List<NopPhi> payments = findByHoKhau(hoKhauId);
        return payments.stream()
                .filter(NopPhi::isDaXacNhan)
                .mapToDouble(NopPhi::getSoTien)
                .sum();
    }

    @Override
    public Double calculateTotalPaymentsByKhoanThu(Long khoanThuId) {
        List<NopPhi> payments = findByKhoanThu(khoanThuId);
        return payments.stream()
                .filter(NopPhi::isDaXacNhan)
                .mapToDouble(NopPhi::getSoTien)
                .sum();
    }

    @Override
    public Double calculateTotalPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<NopPhi> payments = findByDateRange(startDate, endDate);
        return payments.stream()
                .filter(NopPhi::isDaXacNhan)
                .mapToDouble(NopPhi::getSoTien)
                .sum();
    }
}