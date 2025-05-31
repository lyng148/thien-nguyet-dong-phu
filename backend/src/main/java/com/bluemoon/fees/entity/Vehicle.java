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
@Table(name = "vehicle")
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "bien_so_xe", nullable = false, unique = true)
    private String bienSoXe;
    
    @Column(name = "loai_xe", nullable = false)
    private String loaiXe; // XE_MAY, OTO
    
    @Column(name = "hang_xe")
    private String hangXe;
    
    @Column(name = "mau_xe")
    private String mauXe;
    
    @Column(name = "nam_san_xuat")
    private Integer namSanXuat;
    
    @Column(name = "mau_sac")
    private String mauSac;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    @Column(name = "ho_khau_id", nullable = false)
    private Long hoKhauId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ho_khau_id", insertable = false, updatable = false)
    @JsonBackReference
    private HoKhau hoKhau;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
