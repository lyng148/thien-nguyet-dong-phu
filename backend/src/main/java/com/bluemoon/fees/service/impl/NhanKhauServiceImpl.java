package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.exception.ResourceNotFoundException;
import com.bluemoon.fees.repository.NhanKhauRepository;
import com.bluemoon.fees.repository.LichSuHoKhauRepository;
import com.bluemoon.fees.repository.TamTruTamVangRepository;
import com.bluemoon.fees.service.NhanKhauService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class NhanKhauServiceImpl implements NhanKhauService {

    private final NhanKhauRepository nhanKhauRepository;
    private final LichSuHoKhauRepository lichSuHoKhauRepository;
    private final TamTruTamVangRepository tamTruTamVangRepository;

    @Override
    public NhanKhau save(NhanKhau entity) {
        return nhanKhauRepository.save(entity);
    }

    @Override
    public List<NhanKhau> saveAll(List<NhanKhau> entities) {
        return nhanKhauRepository.saveAll(entities);
    }

    @Override
    public Optional<NhanKhau> findById(Long id) {
        return nhanKhauRepository.findById(id);
    }

    @Override
    public List<NhanKhau> findAll() {
        return nhanKhauRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        nhanKhauRepository.deleteById(id);
    }

    @Override
    public void delete(NhanKhau entity) {
        nhanKhauRepository.delete(entity);
    }

    @Override
    public boolean existsById(Long id) {
        return nhanKhauRepository.existsById(id);
    }

    @Override
    public List<NhanKhau> searchByHoTen(String hoTen) {
        return nhanKhauRepository.findByHoTenContainingIgnoreCase(hoTen);
    }

    @Override
    public NhanKhau findByCccd(String cccd) {
        return nhanKhauRepository.findByCccd(cccd)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with CCCD: " + cccd));
    }

    @Override
    public List<NhanKhau> findByNgaySinhRange(LocalDate startDate, LocalDate endDate) {
        return nhanKhauRepository.findByNgaySinhBetween(startDate, endDate);
    }

    @Override
    public List<NhanKhau> findByQuanHeVoiChuHo(String quanHeVoiChuHo) {
        return nhanKhauRepository.findByQuanHeVoiChuHo(quanHeVoiChuHo);
    }

    @Override
    public NhanKhau createNhanKhau(NhanKhau nhanKhau) {
        // Set default values if needed
        if (nhanKhau.getNgayThemNhanKhau() == null) {
            nhanKhau.setNgayThemNhanKhau(LocalDate.now());
        }
        
        return nhanKhauRepository.save(nhanKhau);
    }

    @Override
    public NhanKhau updateNhanKhau(Long id, NhanKhau nhanKhau) {
        NhanKhau existingNhanKhau = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + id));
        
        // Update fields
        existingNhanKhau.setHoTen(nhanKhau.getHoTen());
        existingNhanKhau.setNgaySinh(nhanKhau.getNgaySinh());
        existingNhanKhau.setGioiTinh(nhanKhau.getGioiTinh());
        existingNhanKhau.setDanToc(nhanKhau.getDanToc());
        existingNhanKhau.setTonGiao(nhanKhau.getTonGiao());
        existingNhanKhau.setCccd(nhanKhau.getCccd());
        existingNhanKhau.setNgayCap(nhanKhau.getNgayCap());
        existingNhanKhau.setNoiCap(nhanKhau.getNoiCap());
        existingNhanKhau.setNgheNghiep(nhanKhau.getNgheNghiep());
        existingNhanKhau.setGhiChu(nhanKhau.getGhiChu());
        
        // Don't update HoKhau and QuanHeVoiChuHo here - that should be managed through HoKhauService
        
        return nhanKhauRepository.save(existingNhanKhau);
    }

    @Override
    public void deleteNhanKhau(Long id) {
        NhanKhau nhanKhau = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + id));
        
        // Check if the person is part of a household and remove from household if needed
        if (nhanKhau.getHoKhau() != null) {
            nhanKhau.getHoKhau().removeNhanKhau(nhanKhau);
        }
        
        // Delete related household history records
        lichSuHoKhauRepository.findByNhanKhauId(id).forEach(lichSuHoKhau -> {
            lichSuHoKhauRepository.delete(lichSuHoKhau);
        });
        
        // Delete related temporary residence records
        tamTruTamVangRepository.findByNhanKhauId(id).forEach(tamTruTamVang -> {
            tamTruTamVangRepository.delete(tamTruTamVang);
        });
        
        // Now it's safe to delete the person
        delete(nhanKhau);
    }
}