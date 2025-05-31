package com.bluemoon.fees.entity;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ho_khau")
@ToString(exclude = {"cacKhoanNop", "cacNhanKhau", "cacXe"})
@JsonIdentityInfo(
  generator = ObjectIdGenerators.PropertyGenerator.class, 
  property = "id",
  scope = HoKhau.class
)
public class HoKhau {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "so_ho_khau", nullable = false, unique = true)
    private String soHoKhau;
    
    @Column(name = "chu_ho", nullable = false)
    private String chuHo;
    
    // Keep address as requested
    @Column(nullable = false)
    private String address;
    
    @Column(name = "so_nha")
    private String soNha;
    
    @Column(name = "duong")
    private String duong;
    
    @Column(name = "phuong")
    private String phuong;
    
    @Column(name = "quan")
    private String quan;
    
    @Column(name = "so_thanh_vien", nullable = false)
    private Integer soThanhVien;
    
    @Column(name = "so_dien_thoai")
    private String soDienThoai;
    
    @Column
    private String email;
    
    @Column(name = "ngay_lam_ho_khau")
    private LocalDate ngayLamHoKhau;
    
    @OneToMany(mappedBy = "hoKhau", cascade = CascadeType.ALL)
    @JsonIdentityReference(alwaysAsId = true)
    private List<NopPhi> cacKhoanNop;
      @OneToMany(mappedBy = "hoKhau", cascade = CascadeType.ALL)
    private List<NhanKhau> cacNhanKhau = new ArrayList<>();
    
    @OneToMany(mappedBy = "hoKhau", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Vehicle> cacXe = new ArrayList<>();
      @Column(nullable = false)
    private boolean hoatDong = true;
    
    // Helper methods for managing bidirectional relationships
    public void addNhanKhau(NhanKhau nhanKhau) {
        if (cacNhanKhau == null) {
            cacNhanKhau = new ArrayList<>();
        }
        cacNhanKhau.add(nhanKhau);
        nhanKhau.setHoKhau(this);
    }
    
    public void removeNhanKhau(NhanKhau nhanKhau) {
        if (cacNhanKhau != null) {
            cacNhanKhau.remove(nhanKhau);
            nhanKhau.setHoKhau(null);
        }
    }
    
    public void addVehicle(Vehicle vehicle) {
        if (cacXe == null) {
            cacXe = new ArrayList<>();
        }
        cacXe.add(vehicle);
        vehicle.setHoKhau(this);
    }
    
    public void removeVehicle(Vehicle vehicle) {
        if (cacXe != null) {
            cacXe.remove(vehicle);
            vehicle.setHoKhau(null);
        }
    }
    
    @PrePersist
    protected void onCreate() {
        if (ngayLamHoKhau == null) {
            ngayLamHoKhau = LocalDate.now();
        }
    }
}