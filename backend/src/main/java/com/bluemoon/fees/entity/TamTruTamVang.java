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
@Table(name = "tam_tru_tam_vang")
public class TamTruTamVang {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "trang_thai", nullable = false)
    @Enumerated(EnumType.STRING)
    private TrangThai trangThai;
    
    @Column(name = "dia_chi_tam_tru_tam_vang", nullable = false)
    private String diaChiTamTruTamVang;
    
    @Column(name = "thoi_gian", nullable = false)
    private LocalDate thoiGian;
    
    @Column(name = "noi_dung_de_nghi")
    private String noiDungDeNghi;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nhan_khau_id", nullable = false)
    private NhanKhau nhanKhau;
    
    public enum TrangThai {
        TAM_TRU,
        TAM_VANG
    }
}