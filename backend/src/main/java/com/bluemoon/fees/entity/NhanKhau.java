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
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "nhan_khau")
@JsonIdentityInfo(
  generator = ObjectIdGenerators.PropertyGenerator.class, 
  property = "id",
  scope = NhanKhau.class
)
public class NhanKhau {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ho_ten", nullable = false)
    private String hoTen;
    
    @Column(name = "ngay_sinh", nullable = false)
    private LocalDate ngaySinh;
    
    @Column(name = "gioi_tinh", nullable = false)
    private String gioiTinh;
    
    @Column(name = "dan_toc")
    private String danToc;
    
    @Column(name = "ton_giao")
    private String tonGiao;
    
    @Column(name = "cccd")
    private String cccd;
    
    @Column(name = "ngay_cap")
    private LocalDate ngayCap;
    
    @Column(name = "noi_cap")
    private String noiCap;
    
    @Column(name = "nghe_nghiep")
    private String ngheNghiep;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    @Column(name = "ngay_them_nhan_khau", nullable = false)
    private LocalDate ngayThemNhanKhau;
    
    @Column(name = "quan_he_voi_chu_ho")
    private String quanHeVoiChuHo;    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "ho_khau_id")
    @JsonIdentityReference(alwaysAsId = true)
    private HoKhau hoKhau;
    
    @OneToMany(mappedBy = "nhanKhau", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIdentityReference(alwaysAsId = true)
    private List<LichSuHoKhau> lichSuHoKhau;
    
    @OneToMany(mappedBy = "nhanKhau", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIdentityReference(alwaysAsId = true)
    private List<TamTruTamVang> tamTruTamVang;
    
    @PrePersist
    protected void onCreate() {
        if (ngayThemNhanKhau == null) {
            ngayThemNhanKhau = LocalDate.now();
        }
    }
}