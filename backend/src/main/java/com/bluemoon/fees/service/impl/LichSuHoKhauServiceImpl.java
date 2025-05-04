package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.LichSuHoKhau;
import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.exception.ResourceNotFoundException;
import com.bluemoon.fees.repository.LichSuHoKhauRepository;
import com.bluemoon.fees.repository.HoKhauRepository;
import com.bluemoon.fees.repository.NhanKhauRepository;
import com.bluemoon.fees.service.LichSuHoKhauService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class LichSuHoKhauServiceImpl implements LichSuHoKhauService {

    private final LichSuHoKhauRepository lichSuHoKhauRepository;
    private final HoKhauRepository hoKhauRepository;
    private final NhanKhauRepository nhanKhauRepository;

    @Override
    public LichSuHoKhau save(LichSuHoKhau entity) {
        return lichSuHoKhauRepository.save(entity);
    }

    @Override
    public List<LichSuHoKhau> saveAll(List<LichSuHoKhau> entities) {
        return lichSuHoKhauRepository.saveAll(entities);
    }

    @Override
    public Optional<LichSuHoKhau> findById(Long id) {
        return lichSuHoKhauRepository.findById(id);
    }

    @Override
    public List<LichSuHoKhau> findAll() {
        return lichSuHoKhauRepository.findAll();
    }

    @Override
    public void deleteById(Long id) {
        lichSuHoKhauRepository.deleteById(id);
    }

    @Override
    public void delete(LichSuHoKhau entity) {
        lichSuHoKhauRepository.delete(entity);
    }

    @Override
    public boolean existsById(Long id) {
        return lichSuHoKhauRepository.existsById(id);
    }

    @Override
    public List<LichSuHoKhau> findByHoKhau(HoKhau hoKhau) {
        return lichSuHoKhauRepository.findByHoKhau(hoKhau);
    }

    @Override
    public List<LichSuHoKhau> findByHoKhauId(Long hoKhauId) {
        return lichSuHoKhauRepository.findByHoKhauId(hoKhauId);
    }

    @Override
    public List<LichSuHoKhau> findByNhanKhau(NhanKhau nhanKhau) {
        return lichSuHoKhauRepository.findByNhanKhau(nhanKhau);
    }

    @Override
    public List<LichSuHoKhau> findByNhanKhauId(Long nhanKhauId) {
        return lichSuHoKhauRepository.findByNhanKhauId(nhanKhauId);
    }

    @Override
    public List<LichSuHoKhau> findByLoaiThayDoi(LichSuHoKhau.LoaiThayDoi loaiThayDoi) {
        return lichSuHoKhauRepository.findByLoaiThayDoi(loaiThayDoi);
    }

    @Override
    public List<LichSuHoKhau> findByThoiGianRange(LocalDate startDate, LocalDate endDate) {
        return lichSuHoKhauRepository.findByThoiGianBetween(startDate, endDate);
    }

    @Override
    public LichSuHoKhau createLichSuHoKhau(LichSuHoKhau lichSuHoKhau) {
        // Fetch full entities if needed
        if (lichSuHoKhau.getHoKhau() != null && lichSuHoKhau.getHoKhau().getId() != null) {
            HoKhau hoKhau = hoKhauRepository.findById(lichSuHoKhau.getHoKhau().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + lichSuHoKhau.getHoKhau().getId()));
            lichSuHoKhau.setHoKhau(hoKhau);
        }
        
        if (lichSuHoKhau.getNhanKhau() != null && lichSuHoKhau.getNhanKhau().getId() != null) {
            NhanKhau nhanKhau = nhanKhauRepository.findById(lichSuHoKhau.getNhanKhau().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + lichSuHoKhau.getNhanKhau().getId()));
            lichSuHoKhau.setNhanKhau(nhanKhau);
        }
        
        // Set default values if needed
        if (lichSuHoKhau.getThoiGian() == null) {
            lichSuHoKhau.setThoiGian(LocalDate.now());
        }
        
        return lichSuHoKhauRepository.save(lichSuHoKhau);
    }

    @Override
    public LichSuHoKhau updateLichSuHoKhau(Long id, LichSuHoKhau lichSuHoKhau) {
        LichSuHoKhau existingRecord = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Household history record not found with ID: " + id));
        
        // Maintain important references
        lichSuHoKhau.setId(existingRecord.getId());
        
        // Update specific fields
        if (lichSuHoKhau.getLoaiThayDoi() != null) {
            existingRecord.setLoaiThayDoi(lichSuHoKhau.getLoaiThayDoi());
        }
        
        if (lichSuHoKhau.getThoiGian() != null) {
            existingRecord.setThoiGian(lichSuHoKhau.getThoiGian());
        }
        
        if (lichSuHoKhau.getGhiChu() != null) {
            existingRecord.setGhiChu(lichSuHoKhau.getGhiChu());
        }
        
        // Update references if needed
        if (lichSuHoKhau.getHoKhau() != null && lichSuHoKhau.getHoKhau().getId() != null) {
            HoKhau hoKhau = hoKhauRepository.findById(lichSuHoKhau.getHoKhau().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + lichSuHoKhau.getHoKhau().getId()));
            existingRecord.setHoKhau(hoKhau);
        }
        
        if (lichSuHoKhau.getNhanKhau() != null && lichSuHoKhau.getNhanKhau().getId() != null) {
            NhanKhau nhanKhau = nhanKhauRepository.findById(lichSuHoKhau.getNhanKhau().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + lichSuHoKhau.getNhanKhau().getId()));
            existingRecord.setNhanKhau(nhanKhau);
        }
        
        return lichSuHoKhauRepository.save(existingRecord);
    }

    @Override
    public void deleteLichSuHoKhau(Long id) {
        LichSuHoKhau record = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Household history record not found with ID: " + id));
        delete(record);
    }
    
    @Override
    public HoKhau getHoKhauReference(Long hoKhauId) {
        return hoKhauRepository.findById(hoKhauId)
                .orElseThrow(() -> new ResourceNotFoundException("Household not found with ID: " + hoKhauId));
    }
    
    @Override
    public NhanKhau getNhanKhauReference(Long nhanKhauId) {
        return nhanKhauRepository.findById(nhanKhauId)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found with ID: " + nhanKhauId));
    }
}