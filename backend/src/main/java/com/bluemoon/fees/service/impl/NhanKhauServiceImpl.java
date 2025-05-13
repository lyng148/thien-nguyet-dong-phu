package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.exception.ResourceNotFoundException;
import com.bluemoon.fees.repository.NhanKhauRepository;
import com.bluemoon.fees.repository.LichSuHoKhauRepository;
import com.bluemoon.fees.repository.TamTruTamVangRepository;
import com.bluemoon.fees.service.NhanKhauService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
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
    @Transactional
    public NhanKhau createNhanKhau(NhanKhau nhanKhau) {
        if (nhanKhau.getNgayThemNhanKhau() == null) {
            nhanKhau.setNgayThemNhanKhau(LocalDate.now());
        }
        return nhanKhauRepository.save(nhanKhau);
    }

    @Override
    @Transactional
    public NhanKhau updateNhanKhau(Long id, NhanKhau nhanKhauRequest) {
        log.info("Updating person with id: {}", id);
        
        NhanKhau existingNhanKhau = nhanKhauRepository.findById(id)
            .orElseThrow(() -> {
                log.error("Person with id {} not found", id);
                return new EntityNotFoundException("Không tìm thấy nhân khẩu với ID: " + id);
            });
        
        // Only update fields that are provided (not null)
        if (nhanKhauRequest.getHoTen() != null) {
            existingNhanKhau.setHoTen(nhanKhauRequest.getHoTen());
        }
        
        if (nhanKhauRequest.getNgaySinh() != null) {
            existingNhanKhau.setNgaySinh(nhanKhauRequest.getNgaySinh());
        }
        
        if (nhanKhauRequest.getGioiTinh() != null) {
            existingNhanKhau.setGioiTinh(nhanKhauRequest.getGioiTinh());
        }
        
        if (nhanKhauRequest.getDanToc() != null) {
            existingNhanKhau.setDanToc(nhanKhauRequest.getDanToc());
        }
        
        if (nhanKhauRequest.getTonGiao() != null) {
            existingNhanKhau.setTonGiao(nhanKhauRequest.getTonGiao());
        }
        
        if (nhanKhauRequest.getCccd() != null) {
            existingNhanKhau.setCccd(nhanKhauRequest.getCccd());
        }
        
        if (nhanKhauRequest.getNgayCap() != null) {
            existingNhanKhau.setNgayCap(nhanKhauRequest.getNgayCap());
        }
        
        if (nhanKhauRequest.getNoiCap() != null) {
            existingNhanKhau.setNoiCap(nhanKhauRequest.getNoiCap());
        }
        
        if (nhanKhauRequest.getNgheNghiep() != null) {
            existingNhanKhau.setNgheNghiep(nhanKhauRequest.getNgheNghiep());
        }
        
        if (nhanKhauRequest.getGhiChu() != null) {
            existingNhanKhau.setGhiChu(nhanKhauRequest.getGhiChu());
        }
        
        if (nhanKhauRequest.getHoKhau() != null) {
            existingNhanKhau.setHoKhau(nhanKhauRequest.getHoKhau());
        }
        
        if (nhanKhauRequest.getQuanHeVoiChuHo() != null) {
            existingNhanKhau.setQuanHeVoiChuHo(nhanKhauRequest.getQuanHeVoiChuHo());
        }
        
        log.info("Saving updated person: {}", existingNhanKhau);
        return nhanKhauRepository.save(existingNhanKhau);
    }

    @Override
    @Transactional
    public void deleteNhanKhau(Long id) {
        NhanKhau nhanKhau = nhanKhauRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhân khẩu với ID: " + id));
            
        nhanKhauRepository.delete(nhanKhau);
    }
}