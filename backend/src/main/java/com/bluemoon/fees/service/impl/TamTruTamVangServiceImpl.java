package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.TamTruTamVang;
import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.exception.ResourceNotFoundException;
import com.bluemoon.fees.repository.TamTruTamVangRepository;
import com.bluemoon.fees.repository.NhanKhauRepository;
import com.bluemoon.fees.service.TamTruTamVangService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class TamTruTamVangServiceImpl implements TamTruTamVangService {

    private final TamTruTamVangRepository tamTruTamVangRepository;
    private final NhanKhauRepository nhanKhauRepository;

    @Override
    public TamTruTamVang save(TamTruTamVang entity) {
        return tamTruTamVangRepository.save(entity);
    }

    @Override
    public List<TamTruTamVang> saveAll(List<TamTruTamVang> entities) {
        return tamTruTamVangRepository.saveAll(entities);
    }

    @Override
    public Optional<TamTruTamVang> findById(Long id) {
        return tamTruTamVangRepository.findById(id);
    }

    @Override
    public List<TamTruTamVang> findAll() {
        return tamTruTamVangRepository.findAll();
    }

    @Override
    public Page<TamTruTamVang> findAll(Pageable pageable) {
        Page<TamTruTamVang> page = tamTruTamVangRepository.findAll(pageable);
        
        // Initialize any lazy-loaded relationships to prevent serialization issues
        page.getContent().forEach(record -> {
            if (record.getNhanKhau() != null) {
                try {
                    // Force loading of properties we need
                    Long nhanKhauId = record.getNhanKhau().getId();
                    String hoTen = record.getNhanKhau().getHoTen();
                    
                    // Set the transient fields for serialization
                    record.getNhanKhauId();
                    record.getHoTen();
                } catch (Exception e) {
                    // Log and continue if there's an issue with a specific record
                    System.err.println("Error initializing person data for record " + record.getId() + ": " + e.getMessage());
                }
            }
        });
        
        return page;
    }

    @Override
    public void deleteById(Long id) {
        tamTruTamVangRepository.deleteById(id);
    }

    @Override
    public void delete(TamTruTamVang entity) {
        tamTruTamVangRepository.delete(entity);
    }

    @Override
    public boolean existsById(Long id) {
        return tamTruTamVangRepository.existsById(id);
    }

    @Override
    public List<TamTruTamVang> findByTrangThai(TamTruTamVang.TrangThai trangThai) {
        return tamTruTamVangRepository.findByTrangThai(trangThai);
    }

    @Override
    public List<TamTruTamVang> findByNhanKhau(NhanKhau nhanKhau) {
        return tamTruTamVangRepository.findByNhanKhau(nhanKhau);
    }

    @Override
    public List<TamTruTamVang> findByNhanKhauId(Long nhanKhauId) {
        return tamTruTamVangRepository.findByNhanKhauId(nhanKhauId);
    }

    @Override
    public List<TamTruTamVang> findByThoiGianRange(LocalDate startDate, LocalDate endDate) {
        return tamTruTamVangRepository.findByThoiGianBetween(startDate, endDate);
    }

    @Override
    public TamTruTamVang createTamTruTamVang(TamTruTamVang tamTruTamVang) {
        // Fetch the full NhanKhau entity if needed
        if (tamTruTamVang.getNhanKhau() != null && tamTruTamVang.getNhanKhau().getId() != null) {
            NhanKhau nhanKhau = nhanKhauRepository.findById(tamTruTamVang.getNhanKhau().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + tamTruTamVang.getNhanKhau().getId()));
            tamTruTamVang.setNhanKhau(nhanKhau);
        }
        
        // Set default values if needed
        if (tamTruTamVang.getThoiGian() == null) {
            tamTruTamVang.setThoiGian(LocalDate.now());
        }
        
        return tamTruTamVangRepository.save(tamTruTamVang);
    }

    @Override
    public TamTruTamVang updateTamTruTamVang(Long id, TamTruTamVang tamTruTamVang) {
        TamTruTamVang existingRecord = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Temporary residence/absence record not found with ID: " + id));
        
        // Maintain important references
        tamTruTamVang.setId(existingRecord.getId());
        
        // Update specific fields
        if (tamTruTamVang.getTrangThai() != null) {
            existingRecord.setTrangThai(tamTruTamVang.getTrangThai());
        }
        
        if (tamTruTamVang.getDiaChiTamTruTamVang() != null) {
            existingRecord.setDiaChiTamTruTamVang(tamTruTamVang.getDiaChiTamTruTamVang());
        }
        
        if (tamTruTamVang.getThoiGian() != null) {
            existingRecord.setThoiGian(tamTruTamVang.getThoiGian());
        }
        
        if (tamTruTamVang.getNoiDungDeNghi() != null) {
            existingRecord.setNoiDungDeNghi(tamTruTamVang.getNoiDungDeNghi());
        }
        
        // Update NhanKhau reference if needed
        if (tamTruTamVang.getNhanKhau() != null && tamTruTamVang.getNhanKhau().getId() != null) {
            NhanKhau nhanKhau = nhanKhauRepository.findById(tamTruTamVang.getNhanKhau().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + tamTruTamVang.getNhanKhau().getId()));
            existingRecord.setNhanKhau(nhanKhau);
        }
        
        return tamTruTamVangRepository.save(existingRecord);
    }

    @Override
    public void deleteTamTruTamVang(Long id) {
        TamTruTamVang record = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Temporary residence/absence record not found with ID: " + id));
        delete(record);
    }
}