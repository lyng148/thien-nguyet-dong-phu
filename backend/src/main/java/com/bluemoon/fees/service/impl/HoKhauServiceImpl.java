package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.LichSuHoKhau;
import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.exception.GlobalExceptionHandler;
import com.bluemoon.fees.exception.ResourceNotFoundException;
import com.bluemoon.fees.repository.HoKhauRepository;
import com.bluemoon.fees.repository.LichSuHoKhauRepository;
import com.bluemoon.fees.repository.NhanKhauRepository;
import com.bluemoon.fees.service.HoKhauService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class HoKhauServiceImpl implements HoKhauService {

    private final HoKhauRepository hoKhauRepository;
    private final NhanKhauRepository nhanKhauRepository;
    private final LichSuHoKhauRepository lichSuHoKhauRepository;

    @Override
    public List<HoKhau> findAll() {
        return hoKhauRepository.findAll();
    }

    @Override
    public List<HoKhau> findAllActive() {
        return hoKhauRepository.findByHoatDongTrue();
    }

    @Override
    public Optional<HoKhau> findById(Long id) {
        return hoKhauRepository.findById(id);
    }

    @Override
    public HoKhau findActiveById(Long id) {
        return hoKhauRepository.findByIdAndHoatDongTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với ID: " + id));
    }

    @Override
    public HoKhau findBySoHoKhau(String soHoKhau) {
        return hoKhauRepository.findBySoHoKhau(soHoKhau)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với số hộ khẩu: " + soHoKhau));
    }

    @Override
    public List<HoKhau> searchByChuHo(String chuHo) {
        return hoKhauRepository.findByChuHoContainingIgnoreCase(chuHo);
    }

    @Override
    public List<HoKhau> searchByAddress(String address) {
        return hoKhauRepository.findByAddressContainingIgnoreCase(address);
    }

    @Override
    public HoKhau createHoKhau(HoKhau hoKhau) {
        hoKhau.setSoThanhVien(0); // Start with 0 members
        hoKhau.setHoatDong(true);
        return hoKhauRepository.save(hoKhau);
    }

    @Override
    public HoKhau updateHoKhau(Long id, HoKhau hoKhau) {
        HoKhau existingHoKhau = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với ID: " + id));
        
        existingHoKhau.setSoHoKhau(hoKhau.getSoHoKhau());
        existingHoKhau.setChuHo(hoKhau.getChuHo());
        existingHoKhau.setAddress(hoKhau.getAddress());
        existingHoKhau.setSoNha(hoKhau.getSoNha());
        existingHoKhau.setDuong(hoKhau.getDuong());
        existingHoKhau.setPhuong(hoKhau.getPhuong());
        existingHoKhau.setQuan(hoKhau.getQuan());
        existingHoKhau.setSoDienThoai(hoKhau.getSoDienThoai());
        existingHoKhau.setEmail(hoKhau.getEmail());
        existingHoKhau.setSoThanhVien(hoKhau.getSoThanhVien());
        existingHoKhau.setHoatDong(hoKhau.isHoatDong());
        existingHoKhau.setNgayLamHoKhau(hoKhau.getNgayLamHoKhau());
        
        log.info("Updating household - soThanhVien: {}, hoatDong: {}", hoKhau.getSoThanhVien(), hoKhau.isHoatDong());
        
        return hoKhauRepository.save(existingHoKhau);
    }

    @Override
    public void deleteById(Long id) {
        hoKhauRepository.deleteById(id);
    }

    @Override
    public void deactivateHoKhau(Long id) {
        HoKhau hoKhau = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với ID: " + id));
        hoKhau.setHoatDong(false);
        hoKhauRepository.save(hoKhau);
    }

    @Override
    public void activateHoKhau(Long id) {
        HoKhau hoKhau = findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với ID: " + id));
        hoKhau.setHoatDong(true);
        hoKhauRepository.save(hoKhau);
    }

    @Override
    @Transactional
    public HoKhau addNhanKhauToHoKhau(Long hoKhauId, Long nhanKhauId, String quanHeVoiChuHo, String ghiChu) {
        HoKhau hoKhau = findById(hoKhauId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với ID: " + hoKhauId));
        
        NhanKhau nhanKhau = nhanKhauRepository.findById(nhanKhauId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân khẩu với ID: " + nhanKhauId));
        
        // Check if the person is already in another household
        if (nhanKhau.getHoKhau() != null) {
            throw new IllegalStateException(
                    "Nhân khẩu này đã thuộc về hộ khẩu " + nhanKhau.getHoKhau().getSoHoKhau() + 
                    ". Hãy xóa nhân khẩu khỏi hộ khẩu cũ trước khi thêm vào hộ khẩu mới.");
        }
        
        // Update the relationship
        nhanKhau.setQuanHeVoiChuHo(quanHeVoiChuHo);
        hoKhau.addNhanKhau(nhanKhau);
        
        // Save the change to the household history
        LichSuHoKhau lichSuHoKhau = LichSuHoKhau.builder()
                .loaiThayDoi(LichSuHoKhau.LoaiThayDoi.THEM_NHAN_KHAU)
                .thoiGian(LocalDate.now())
                .hoKhau(hoKhau)
                .nhanKhau(nhanKhau)
                .ghiChu(ghiChu)
                .build();
        
        lichSuHoKhauRepository.save(lichSuHoKhau);
        
        return hoKhauRepository.save(hoKhau);
    }

    @Override
    @Transactional
    public HoKhau removeNhanKhauFromHoKhau(Long hoKhauId, Long nhanKhauId, String ghiChu) {
        HoKhau hoKhau = findById(hoKhauId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với ID: " + hoKhauId));
        
        NhanKhau nhanKhau = nhanKhauRepository.findById(nhanKhauId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân khẩu với ID: " + nhanKhauId));
        
        // Check if the person is actually in this household
        if (nhanKhau.getHoKhau() == null || !nhanKhau.getHoKhau().getId().equals(hoKhauId)) {
            throw new IllegalStateException("Nhân khẩu này không thuộc về hộ khẩu này.");
        }
        
        // Update the relationship
        hoKhau.removeNhanKhau(nhanKhau);
        
        // Save the change to the household history
        LichSuHoKhau lichSuHoKhau = LichSuHoKhau.builder()
                .loaiThayDoi(LichSuHoKhau.LoaiThayDoi.XOA_NHAN_KHAU)
                .thoiGian(LocalDate.now())
                .hoKhau(hoKhau)
                .nhanKhau(nhanKhau)
                .ghiChu(ghiChu)
                .build();
        
        lichSuHoKhauRepository.save(lichSuHoKhau);
        
        return hoKhauRepository.save(hoKhau);
    }

    @Override
    public List<NhanKhau> getNhanKhauInHoKhau(Long hoKhauId) {
        HoKhau hoKhau = findById(hoKhauId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hộ khẩu với ID: " + hoKhauId));
        
        return hoKhau.getCacNhanKhau();
    }

    @Override
    public HoKhau save(HoKhau entity) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'save'");
    }

    @Override
    public List<HoKhau> saveAll(List<HoKhau> entities) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'saveAll'");
    }

    @Override
    public void delete(HoKhau entity) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'delete'");
    }

    @Override
    public boolean existsById(Long id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'existsById'");
    }
}