package com.bluemoon.fees.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "lich_su_ho_khau")
public class LichSuHoKhau {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "loai_thay_doi", nullable = false)
    @Enumerated(EnumType.STRING)
    private LoaiThayDoi loaiThayDoi;
    
    @Column(name = "thoi_gian", nullable = false)
    private LocalDate thoiGian;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id", nullable = false)
    private HoKhau hoKhau;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_khau_id", nullable = false)
    private NhanKhau nhanKhau;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    public enum LoaiThayDoi {
        TAM_TRU,
        TAM_VANG,
        THEM_NHAN_KHAU,
        XOA_NHAN_KHAU
    }
    
    @PrePersist
    protected void onCreate() {
        if (thoiGian == null) {
            thoiGian = LocalDate.now();
        }
    }
}