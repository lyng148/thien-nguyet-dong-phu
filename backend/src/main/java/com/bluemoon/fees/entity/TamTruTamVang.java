package com.bluemoon.fees.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
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
@JsonIdentityInfo(
  generator = ObjectIdGenerators.PropertyGenerator.class, 
  property = "id",
  scope = TamTruTamVang.class
)
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
    
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "nhan_khau_id", nullable = false)
    @JsonIdentityReference(alwaysAsId = true)
    private NhanKhau nhanKhau;
    
    // Add this field to store the nhanKhau ID for serialization purposes
    @Transient
    private Long nhanKhauId;
    
    // Add this field to store the person's name for display purposes
    @Transient
    private String hoTen;
    
    // Add getter for nhanKhauId that uses the relationship
    public Long getNhanKhauId() {
        return nhanKhau != null ? nhanKhau.getId() : null;
    }
    
    // Add getter for hoTen that uses the relationship
    public String getHoTen() {
        return nhanKhau != null ? nhanKhau.getHoTen() : null;
    }
    
    public enum TrangThai {
        TAM_TRU,
        TAM_VANG
    }
}