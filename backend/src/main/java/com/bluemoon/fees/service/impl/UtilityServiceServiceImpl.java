package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.dto.UtilityServiceDTO;
import com.bluemoon.fees.dto.UtilityServiceRequest;
import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.UtilityService;
import com.bluemoon.fees.repository.HoKhauRepository;
import com.bluemoon.fees.repository.UtilityServiceRepository;
import com.bluemoon.fees.service.UtilityServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilityServiceServiceImpl implements UtilityServiceService {
    
    private final UtilityServiceRepository utilityServiceRepository;
    private final HoKhauRepository hoKhauRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<UtilityServiceDTO> getAllUtilityServices() {
        return utilityServiceRepository.findAllWithHoKhau().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
      @Override
    @Transactional(readOnly = true)
    public List<UtilityServiceDTO> getUtilityServicesByHoKhauId(Long hoKhauId) {
        return utilityServiceRepository.findByHoKhau_Id(hoKhauId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UtilityServiceDTO> getUtilityServicesByMonthYear(Integer thang, Integer nam) {
        return utilityServiceRepository.findByThangAndNam(thang, nam).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
      @Override
    @Transactional(readOnly = true)
    public List<UtilityServiceDTO> getUtilityServicesByHouseholdAndMonth(Long hoKhauId, Integer thang, Integer nam) {
        return utilityServiceRepository.findByHoKhau_IdAndThangAndNam(hoKhauId, thang, nam).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public UtilityServiceDTO getUtilityServiceById(Long id) {
        UtilityService utilityService = utilityServiceRepository.findByIdWithHoKhau(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));
        return convertToDTO(utilityService);
    }
    
    @Override
    public UtilityServiceDTO createUtilityService(UtilityServiceRequest request) {
        // Validate household exists
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));
          // Check if utility service already exists for this household, service type, month, year
        if (checkUtilityServiceExists(request.getHoKhauId(), request.getLoaiDichVu(), 
                                    request.getThang(), request.getNam(), null)) {
            throw new RuntimeException("Dịch vụ " + request.getLoaiDichVu() + 
                                     " cho tháng " + request.getThang() + "/" + request.getNam() + 
                                     " đã tồn tại cho hộ khẩu này");
        }
        
        // Validate that new reading is greater than old reading only for water and electricity services
        if (request.getChiSoCu() != null && request.getChiSoMoi() != null && 
            ("NUOC".equals(request.getLoaiDichVu()) || "DIEN".equals(request.getLoaiDichVu())) &&
            request.getChiSoMoi() <= request.getChiSoCu()) {
            throw new RuntimeException("Chỉ số mới phải lớn hơn chỉ số cũ");
        }
          UtilityService utilityService = new UtilityService();
        utilityService.setHoKhau(hoKhau);
        utilityService.setLoaiDichVu(request.getLoaiDichVu());
        utilityService.setThang(request.getThang());
        utilityService.setNam(request.getNam());
        utilityService.setChiSoCu(request.getChiSoCu());
        utilityService.setChiSoMoi(request.getChiSoMoi());
        utilityService.setDonGia(request.getDonGia());
        utilityService.setPhiCoDinh(request.getPhiCoDinh());
        utilityService.setGhiChu(request.getGhiChu());
        utilityService.setTrangThai("CHUA_THANH_TOAN");
        utilityService.setDonViTinh(request.getDonViTinh());
          // Calculate total manually before saving
        Double tongTien = 0.0;
          // Debug log để kiểm tra giá trị từ request
        System.out.println("DEBUG - Creating utility service:");
        System.out.println("  request.getTongTien(): " + request.getTongTien());
        System.out.println("  request.getSoTien(): " + request.getSoTien());
        System.out.println("  request.getAmount(): " + request.getAmount());
        System.out.println("  request.getPhiCoDinh(): " + request.getPhiCoDinh());
        System.out.println("  request.getDonGia(): " + request.getDonGia());
        
        if (request.getAmount() != null && request.getAmount() > 0) {
            // Nếu có amount từ request thì dùng giá trị đó (nhập thủ công)
            tongTien = request.getAmount();
            System.out.println("  Using amount from request: " + tongTien);
        } else if (request.getPhiCoDinh() != null && request.getPhiCoDinh() > 0) {
            tongTien = request.getPhiCoDinh();
            System.out.println("  Using phiCoDinh: " + tongTien);
        } else if (request.getChiSoCu() != null && request.getChiSoMoi() != null && request.getDonGia() != null) {
            Double soLuongSuDung = request.getChiSoMoi() - request.getChiSoCu();
            utilityService.setSoLuongSuDung(soLuongSuDung);
            tongTien = soLuongSuDung * request.getDonGia();
            System.out.println("  Calculated from readings: " + tongTien);
        } else if (request.getDonGia() != null) {
            // If only donGia is provided, assume quantity is 1
            tongTien = request.getDonGia();
            System.out.println("  Using donGia as tongTien: " + tongTien);
        }
        
        System.out.println("  Final tongTien before setting: " + tongTien);
        utilityService.setTongTien(tongTien);
        System.out.println("  After setting - utilityService.getTongTien(): " + utilityService.getTongTien());
          UtilityService savedUtilityService = utilityServiceRepository.save(utilityService);
        
        // Debug log để kiểm tra giá trị sau khi save
        System.out.println("  After save - savedUtilityService.getTongTien(): " + savedUtilityService.getTongTien());
        System.out.println("  After save - savedUtilityService.getId(): " + savedUtilityService.getId());
        
        return convertToDTO(savedUtilityService);
    }
    
    @Override
    public UtilityServiceDTO updateUtilityService(Long id, UtilityServiceRequest request) {
        UtilityService existingUtilityService = utilityServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));
        
        // Validate household exists
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));
          // Check if utility service already exists (excluding current record)
        if (checkUtilityServiceExists(request.getHoKhauId(), request.getLoaiDichVu(), 
                                    request.getThang(), request.getNam(), id)) {
            throw new RuntimeException("Dịch vụ " + request.getLoaiDichVu() + 
                                     " cho tháng " + request.getThang() + "/" + request.getNam() + 
                                     " đã tồn tại cho hộ khẩu này");
        }
        
        // Validate that new reading is greater than old reading only for water and electricity services
        if (request.getChiSoCu() != null && request.getChiSoMoi() != null && 
            ("NUOC".equals(request.getLoaiDichVu()) || "DIEN".equals(request.getLoaiDichVu())) &&
            request.getChiSoMoi() <= request.getChiSoCu()) {
            throw new RuntimeException("Chỉ số mới phải lớn hơn chỉ số cũ");
        }        
        existingUtilityService.setHoKhau(hoKhau);
        existingUtilityService.setLoaiDichVu(request.getLoaiDichVu());
        existingUtilityService.setThang(request.getThang());
        existingUtilityService.setNam(request.getNam());
        existingUtilityService.setChiSoCu(request.getChiSoCu());
        existingUtilityService.setChiSoMoi(request.getChiSoMoi());
        existingUtilityService.setDonGia(request.getDonGia());
        existingUtilityService.setPhiCoDinh(request.getPhiCoDinh());
        existingUtilityService.setGhiChu(request.getGhiChu());
        existingUtilityService.setDonViTinh(request.getDonViTinh());
          // Calculate total manually before saving
        Double tongTien = 0.0;
        
        // Debug log để kiểm tra giá trị từ request
        System.out.println("DEBUG - Updating utility service:");
        System.out.println("  request.getTongTien(): " + request.getTongTien());
        System.out.println("  request.getSoTien(): " + request.getSoTien());
        System.out.println("  request.getAmount(): " + request.getAmount());
        System.out.println("  request.getPhiCoDinh(): " + request.getPhiCoDinh());
        System.out.println("  request.getDonGia(): " + request.getDonGia());
        
        // Use the getAmount() helper method which prioritizes soTien over tongTien
        if (request.getAmount() != null && request.getAmount() > 0) {
            // Nếu có amount từ request thì dùng giá trị đó (nhập thủ công)
            tongTien = request.getAmount();
            System.out.println("  Using amount from request: " + tongTien);        } else if (request.getPhiCoDinh() != null && request.getPhiCoDinh() > 0) {
            tongTien = request.getPhiCoDinh();
            System.out.println("  Using phiCoDinh: " + tongTien);
        } else if (request.getChiSoCu() != null && request.getChiSoMoi() != null && request.getDonGia() != null) {
            Double soLuongSuDung = request.getChiSoMoi() - request.getChiSoCu();
            existingUtilityService.setSoLuongSuDung(soLuongSuDung);
            tongTien = soLuongSuDung * request.getDonGia();
            System.out.println("  Calculated from readings: " + tongTien);
        } else if (request.getDonGia() != null) {
            // If only donGia is provided, assume quantity is 1
            tongTien = request.getDonGia();
            System.out.println("  Using donGia as tongTien: " + tongTien);
        }
        
        System.out.println("  Final tongTien before setting: " + tongTien);
        existingUtilityService.setTongTien(tongTien);
        System.out.println("  After setting - existingUtilityService.getTongTien(): " + existingUtilityService.getTongTien());
        
        UtilityService updatedUtilityService = utilityServiceRepository.save(existingUtilityService);
        
        // Debug log để kiểm tra giá trị sau khi save
        System.out.println("  After save - updatedUtilityService.getTongTien(): " + updatedUtilityService.getTongTien());
        System.out.println("  After save - updatedUtilityService.getId(): " + updatedUtilityService.getId());
        return convertToDTO(updatedUtilityService);
    }
    
    @Override
    public void deleteUtilityService(Long id) {
        UtilityService utilityService = utilityServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + id));
        
        // Check if there are any payments for this service
        if ("DA_THANH_TOAN".equals(utilityService.getTrangThai())) {
            throw new RuntimeException("Không thể xóa dịch vụ đã được thanh toán");
        }
        
        utilityServiceRepository.delete(utilityService);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean checkUtilityServiceExists(Long hoKhauId, String loaiDichVu, Integer thang, Integer nam, Long utilityId) {
        return utilityServiceRepository.existsByHoKhauIdAndLoaiDichVuAndThangAndNamAndIdNot(
                hoKhauId, loaiDichVu, thang, nam, utilityId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UtilityServiceDTO> searchUtilityServices(String search) {
        return utilityServiceRepository.searchUtilityServices(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public double calculateTotalUtilityFee(Long hoKhauId, Integer thang, Integer nam) {
        Double total = utilityServiceRepository.calculateTotalUtilityFeeByHouseholdAndMonth(hoKhauId, thang, nam);
        return total != null ? total : 0.0;
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UtilityServiceDTO> getUnpaidUtilityServices(Long hoKhauId) {
        return utilityServiceRepository.findUnpaidUtilityServicesByHousehold(hoKhauId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public void markAsPaid(Long utilityServiceId) {
        UtilityService utilityService = utilityServiceRepository.findById(utilityServiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + utilityServiceId));
        
        utilityService.setTrangThai("DA_THANH_TOAN");
        utilityServiceRepository.save(utilityService);
    }
    
    @Override
    public void markAsUnpaid(Long utilityServiceId) {
        UtilityService utilityService = utilityServiceRepository.findById(utilityServiceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ với ID: " + utilityServiceId));
        
        utilityService.setTrangThai("CHUA_THANH_TOAN");
        utilityServiceRepository.save(utilityService);
    }
      private UtilityServiceDTO convertToDTO(UtilityService utilityService) {
        UtilityServiceDTO dto = new UtilityServiceDTO();
        dto.setId(utilityService.getId());
        dto.setHoKhauId(utilityService.getHoKhau() != null ? utilityService.getHoKhau().getId() : null);
        dto.setLoaiDichVu(utilityService.getLoaiDichVu());
        dto.setThang(utilityService.getThang());
        dto.setNam(utilityService.getNam());
        dto.setChiSoCu(utilityService.getChiSoCu());
        dto.setChiSoMoi(utilityService.getChiSoMoi());
        dto.setSoLuongSuDung(utilityService.getSoLuongSuDung());
        dto.setDonGia(utilityService.getDonGia());
        dto.setPhiCoDinh(utilityService.getPhiCoDinh());
        dto.setTongTien(utilityService.getTongTien());
        dto.setTrangThai(utilityService.getTrangThai());
        dto.setNgayGhiNhan(utilityService.getNgayGhiNhan());
        dto.setGhiChu(utilityService.getGhiChu());
        dto.setDonViTinh(utilityService.getDonViTinh());
        
        // Set household information if available
        if (utilityService.getHoKhau() != null) {
            dto.setSoHoKhau(utilityService.getHoKhau().getSoHoKhau());
            dto.setChuHo(utilityService.getHoKhau().getChuHo());
        }
        
        return dto;
    }
}
