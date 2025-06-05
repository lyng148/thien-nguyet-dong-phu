package com.bluemoon.fees.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "utility_service")
public class UtilityService {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ho_khau_id", nullable = false)
    private Long hoKhauId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id", insertable = false, updatable = false)
    @JsonBackReference
    private HoKhau hoKhau;
    
    @Column(name = "loai_dich_vu", nullable = false)
    private String loaiDichVu; // DIEN, NUOC, INTERNET, GAS, etc.
    
    @Column(name = "thang", nullable = false)
    private Integer thang;
    
    @Column(name = "nam", nullable = false)
    private Integer nam;
    
    // For metered services (electricity, water)
    @Column(name = "chi_so_cu")
    private Double chiSoCu;
    
    @Column(name = "chi_so_moi")
    private Double chiSoMoi;
    
    @Column(name = "so_luong_su_dung")
    private Double soLuongSuDung;
    
    @Column(name = "don_gia")
    private Double donGia; // Price per unit
    
    // For fixed services (internet, maintenance)
    @Column(name = "phi_co_dinh")
    private Double phiCoDinh;
    
    @Column(name = "tong_tien", nullable = false)
    private Double tongTien;
    
    @Column(name = "trang_thai")
    private String trangThai = "CHUA_THANH_TOAN"; // CHUA_THANH_TOAN, DA_THANH_TOAN
    
    @Column(name = "ngay_ghi_nhan")
    private LocalDateTime ngayGhiNhan;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "don_vi_tinh")
    private String donViTinh; // Đơn vị tính cho phí dịch vụ
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (ngayGhiNhan == null) {
            ngayGhiNhan = LocalDateTime.now();
        }
        // Không tự động tính lại tongTien, cho phép nhập thủ công
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        // Không tự động tính lại tongTien, cho phép nhập thủ công
    }
    private void calculateTotal() {
        // Don't override tongTien if it's already set with a non-zero value
        if (tongTien != null && tongTien > 0) {
            // Keep the existing tongTien value (likely manually entered)
            return;
        }
        
        if (phiCoDinh != null && phiCoDinh > 0) {
            // Fixed fee service
            tongTien = phiCoDinh;
        } else if (soLuongSuDung != null && donGia != null) {
            // Metered service
            tongTien = soLuongSuDung * donGia;
        } else if (chiSoCu != null && chiSoMoi != null && donGia != null) {
            // Calculate from meter readings
            soLuongSuDung = chiSoMoi - chiSoCu;
            tongTien = soLuongSuDung * donGia;
        } else {
            // Default to 0 if no valid calculation can be made
            tongTien = 0.0;
        }
        
        // Ensure tongTien is never null
        if (tongTien == null) {
            tongTien = 0.0;
        }
    }
}
