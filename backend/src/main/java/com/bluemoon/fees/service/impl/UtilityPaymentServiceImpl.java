package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.dto.UtilityPaymentDTO;
import com.bluemoon.fees.dto.UtilityPaymentRequest;
import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.UtilityPayment;
import com.bluemoon.fees.entity.UtilityService;
import com.bluemoon.fees.repository.HoKhauRepository;
import com.bluemoon.fees.repository.UtilityPaymentRepository;
import com.bluemoon.fees.repository.UtilityServiceRepository;
import com.bluemoon.fees.service.UtilityPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UtilityPaymentServiceImpl implements UtilityPaymentService {

    private final UtilityPaymentRepository utilityPaymentRepository;
    private final HoKhauRepository hoKhauRepository;
    private final UtilityServiceRepository utilityServiceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UtilityPaymentDTO> getAllUtilityPayments() {
        return utilityPaymentRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityPaymentDTO> getUtilityPaymentsByHoKhauId(Long hoKhauId) {
        return utilityPaymentRepository.findByHoKhauId(hoKhauId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityPaymentDTO> getUtilityPaymentsByUtilityServiceId(Long utilityServiceId) {
        return utilityPaymentRepository.findByUtilityServiceId(utilityServiceId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityPaymentDTO> getUtilityPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return utilityPaymentRepository.findByNgayThanhToanBetween(startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityPaymentDTO> getUtilityPaymentsByHouseholdAndMonth(Long hoKhauId, Integer thang, Integer nam) {
        return utilityPaymentRepository.findByHoKhauIdAndThangAndNam(hoKhauId, thang, nam).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UtilityPaymentDTO getUtilityPaymentById(Long id) {
        UtilityPayment payment = utilityPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với ID: " + id));
        return convertToDTO(payment);
    }    @Override
    public UtilityPaymentDTO createUtilityPayment(UtilityPaymentRequest request) {
        // Validate household exists
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));

        // Lấy thông tin tháng và năm trực tiếp từ request
        Integer thang = request.getThang();
        Integer nam = request.getNam();
        
        // Check if payment already exists for this month
        List<UtilityPayment> existingPayments = utilityPaymentRepository
                .findByHoKhauIdAndThangAndNam(request.getHoKhauId(), thang, nam);
        
        if (!existingPayments.isEmpty()) {
            throw new RuntimeException("Đã có thanh toán cho hộ này trong tháng " + 
                    thang + "/" + nam);
        }

        UtilityPayment payment = new UtilityPayment();
        payment.setHoKhau(hoKhau);
        payment.setHoKhauId(request.getHoKhauId());
          // UtilityServiceId không còn bắt buộc trong entity nhưng vẫn bắt buộc trong DB
        if (request.getUtilityServiceId() != null) {
            try {
                UtilityService utilityService = utilityServiceRepository.findById(request.getUtilityServiceId())
                    .orElse(null);
                payment.setUtilityService(utilityService);
                payment.setUtilityServiceId(request.getUtilityServiceId());
            } catch (Exception e) {
                // Bỏ qua nếu không tìm thấy utilityService
            }
        } else {
            // Nếu không có utilityServiceId, sử dụng giá trị mặc định là 1 để tránh null
            payment.setUtilityServiceId(1L);
        }
        
        payment.setThang(thang);
        payment.setNam(nam);
        payment.setSoTienThanhToan(request.getSoTienThanhToan());
        payment.setPhiGuiXe(request.getPhiGuiXe());
        payment.setPhiDichVu(request.getPhiDichVu());
        payment.setNgayThanhToan(request.getNgayThanhToan() != null ? request.getNgayThanhToan() : LocalDate.now());
        payment.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        payment.setMaGiaoDich(generateTransactionCode());
        payment.setGhiChu(request.getGhiChu());
        payment.setTrangThai("THANH_CONG");
        // onCreate() method will set createdAt and updatedAt automatically

        UtilityPayment savedPayment = utilityPaymentRepository.save(payment);
        return convertToDTO(savedPayment);
    }    @Override
    public UtilityPaymentDTO updateUtilityPayment(Long id, UtilityPaymentRequest request) {
        UtilityPayment payment = utilityPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với ID: " + id));

        // Validate household exists
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));

        payment.setHoKhau(hoKhau);
        payment.setHoKhauId(request.getHoKhauId());
        
        // UtilityServiceId không còn bắt buộc, nhưng nếu có thì vẫn lưu
        if (request.getUtilityServiceId() != null) {
            try {
                UtilityService utilityService = utilityServiceRepository.findById(request.getUtilityServiceId())
                    .orElse(null);
                if (utilityService != null) {
                    payment.setUtilityService(utilityService);
                    payment.setUtilityServiceId(request.getUtilityServiceId());
                }
            } catch (Exception e) {
                // Bỏ qua nếu không tìm thấy utilityService
            }
        }
        
        // Sử dụng thang và nam từ request
        payment.setThang(request.getThang());
        payment.setNam(request.getNam());
        payment.setSoTienThanhToan(request.getSoTienThanhToan());
        payment.setPhiGuiXe(request.getPhiGuiXe());
        payment.setPhiDichVu(request.getPhiDichVu());
        payment.setNgayThanhToan(request.getNgayThanhToan() != null ? request.getNgayThanhToan() : LocalDate.now());
        payment.setPhuongThucThanhToan(request.getPhuongThucThanhToan());
        payment.setGhiChu(request.getGhiChu());
        // onUpdate() method will set updatedAt automatically

        UtilityPayment savedPayment = utilityPaymentRepository.save(payment);
        return convertToDTO(savedPayment);
    }

    @Override
    public void deleteUtilityPayment(Long id) {
        UtilityPayment payment = utilityPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với ID: " + id));
        
        utilityPaymentRepository.delete(payment);
    }

    @Override
    public void cancelUtilityPayment(Long id, String reason) {
        UtilityPayment payment = utilityPaymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với ID: " + id));

        payment.setTrangThai("HUY");
        payment.setGhiChu(payment.getGhiChu() + " - Hủy: " + reason);
        // onUpdate() method will set updatedAt automatically

        utilityPaymentRepository.save(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityPaymentDTO> searchUtilityPayments(String search) {
        return utilityPaymentRepository.searchUtilityPayments(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public double calculateTotalPaid(Long hoKhauId, Integer thang, Integer nam) {
        return utilityPaymentRepository.calculateTotalPaidByHouseholdAndMonth(hoKhauId, thang, nam);
    }

    @Override
    @Transactional(readOnly = true)
    public UtilityPaymentDTO findByTransactionCode(String maGiaoDich) {
        UtilityPayment payment = utilityPaymentRepository.findByMaGiaoDich(maGiaoDich)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với mã giao dịch: " + maGiaoDich));
        return convertToDTO(payment);
    }

    @Override
    public String generateTransactionCode() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomSuffix = String.format("%04d", new Random().nextInt(10000));
        return "UT" + datePrefix + randomSuffix;
    }    private UtilityPaymentDTO convertToDTO(UtilityPayment payment) {
        UtilityPaymentDTO dto = new UtilityPaymentDTO();
        dto.setId(payment.getId());
        dto.setHoKhauId(payment.getHoKhau().getId());
        dto.setSoHoKhau(payment.getHoKhau().getSoHoKhau());
        dto.setChuHo(payment.getHoKhau().getChuHo());
        
        // UtilityService có thể null, xử lý an toàn
        if (payment.getUtilityService() != null) {
            dto.setUtilityServiceId(payment.getUtilityService().getId());
            dto.setLoaiDichVu(payment.getUtilityService().getLoaiDichVu());
        } else {
            dto.setUtilityServiceId(payment.getUtilityServiceId());
            dto.setLoaiDichVu("Không xác định");
        }
        
        dto.setThang(payment.getThang());
        dto.setNam(payment.getNam());
        dto.setSoTienThanhToan(payment.getSoTienThanhToan());
        dto.setPhiGuiXe(payment.getPhiGuiXe() != null ? payment.getPhiGuiXe() : 0.0);
        dto.setPhiDichVu(payment.getPhiDichVu() != null ? payment.getPhiDichVu() : 0.0);
        dto.setNgayThanhToan(payment.getNgayThanhToan());
        dto.setPhuongThucThanhToan(payment.getPhuongThucThanhToan());
        dto.setMaGiaoDich(payment.getMaGiaoDich());
        dto.setGhiChu(payment.getGhiChu());
        dto.setTrangThai(payment.getTrangThai());
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }
}
