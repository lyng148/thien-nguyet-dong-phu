package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.KhoanThu;
import com.bluemoon.fees.exception.ResourceNotFoundException;
import com.bluemoon.fees.repository.KhoanThuRepository;
import com.bluemoon.fees.service.KhoanThuService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class KhoanThuServiceImpl implements KhoanThuService {

    private final KhoanThuRepository khoanThuRepository;

    @Override
    public KhoanThu save(KhoanThu entity) {
        return khoanThuRepository.save(entity);
    }

    @Override
    public List<KhoanThu> saveAll(List<KhoanThu> entities) {
        return khoanThuRepository.saveAll(entities);
    }

    @Override
    public Optional<KhoanThu> findById(Long id) {
        return khoanThuRepository.findById(id);
    }

    @Override
    public List<KhoanThu> findAll() {
        return khoanThuRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        khoanThuRepository.deleteById(id);
    }

    @Override
    public void delete(KhoanThu entity) {
        khoanThuRepository.delete(entity);
    }

    @Override
    public boolean existsById(Long id) {
        return khoanThuRepository.existsById(id);
    }

    @Override
    public List<KhoanThu> findAllActive() {
        return khoanThuRepository.findByHoatDongTrue();
    }

    @Override
    public KhoanThu findActiveById(Long id) {
        return khoanThuRepository.findByIdAndHoatDongTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with ID: " + id));
    }

    @Override
    public List<KhoanThu> findByBatBuoc(Boolean batBuoc) {
        return khoanThuRepository.findByBatBuocAndHoatDongTrue(batBuoc);
    }

    @Override
    public List<KhoanThu> findByThoiHanRange(LocalDate startDate, LocalDate endDate) {
        return khoanThuRepository.findByThoiHanBetweenAndHoatDongTrue(startDate, endDate);
    }

    @Override
    public List<KhoanThu> findOverdueKhoanThu() {
        return khoanThuRepository.findByThoiHanBeforeAndHoatDongTrue(LocalDate.now());
    }

    @Override
    public KhoanThu createKhoanThu(KhoanThu khoanThu) {
        // Set default values if needed
        if (khoanThu.getNgayTao() == null) {
            khoanThu.setNgayTao(LocalDate.now());
        }
        
        khoanThu.setHoatDong(true);
        
        return khoanThuRepository.save(khoanThu);
    }

    @Override
    public KhoanThu updateKhoanThu(Long id, KhoanThu khoanThu) {
        KhoanThu existingKhoanThu = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with ID: " + id));
        
        // Update fields
        existingKhoanThu.setTenKhoanThu(khoanThu.getTenKhoanThu());
        existingKhoanThu.setBatBuoc(khoanThu.getBatBuoc());
        existingKhoanThu.setSoTien(khoanThu.getSoTien());
        existingKhoanThu.setThoiHan(khoanThu.getThoiHan());
        existingKhoanThu.setGhiChu(khoanThu.getGhiChu());
        
        return khoanThuRepository.save(existingKhoanThu);
    }

    @Override
    public void deactivateKhoanThu(Long id) {
        KhoanThu khoanThu = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with ID: " + id));
        khoanThu.setHoatDong(false);
        khoanThuRepository.save(khoanThu);
    }

    @Override
    public void activateKhoanThu(Long id) {
        KhoanThu khoanThu = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee not found with ID: " + id));
        khoanThu.setHoatDong(true);
        khoanThuRepository.save(khoanThu);
    }
}