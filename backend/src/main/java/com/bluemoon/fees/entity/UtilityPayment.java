package com.bluemoon.fees.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "utility_payment")
public class UtilityPayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ho_khau_id", nullable = false)
    private Long hoKhauId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id", insertable = false, updatable = false)
    @JsonBackReference
    private HoKhau hoKhau;
    
    @Column(name = "utility_service_id", nullable = false)
    private Long utilityServiceId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utility_service_id", insertable = false, updatable = false)
    private UtilityService utilityService;
    
    @Column(name = "thang", nullable = false)
    private Integer thang;
    
    @Column(name = "nam", nullable = false)
    private Integer nam;
    
    @Column(name = "so_tien_thanh_toan", nullable = false)
    private Double soTienThanhToan;
    
    @Column(name = "ngay_thanh_toan", nullable = false)
    private LocalDate ngayThanhToan;
    
    @Column(name = "phuong_thuc_thanh_toan", nullable = false)
    private String phuongThucThanhToan = "TIEN_MAT"; // TIEN_MAT, CHUYEN_KHOAN, THE
    
    @Column(name = "ma_giao_dich")
    private String maGiaoDich;
    
    @Column(name = "nguoi_thu")
    private String nguoiThu;
    
    @Column(name = "trang_thai", nullable = false)
    private String trangThai = "DA_THANH_TOAN"; // DA_THANH_TOAN, HUY_BO
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (ngayThanhToan == null) {
            ngayThanhToan = LocalDate.now();
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
