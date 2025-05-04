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
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "khoan_thu")
@ToString(exclude = {"cacKhoanNop"})
@JsonIdentityInfo(
  generator = ObjectIdGenerators.PropertyGenerator.class, 
  property = "id", 
  scope = KhoanThu.class
)
public class KhoanThu {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "ten_khoan_thu", nullable = false)
    private String tenKhoanThu;
    
    @Column(name = "bat_buoc", nullable = false)
    private Boolean batBuoc;
    
    @Column(nullable = false)
    private Double soTien;
    
    @Column(name = "thoi_han", nullable = false)
    private LocalDate thoiHan;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
    
    @Column(name = "ngay_tao", nullable = false)
    private LocalDate ngayTao;
    
    @Column(nullable = false)
    private boolean hoatDong = true;
    
    @OneToMany(mappedBy = "khoanThu", cascade = CascadeType.ALL)
    @JsonIdentityReference(alwaysAsId = true)
    private List<NopPhi> cacKhoanNop;
    
    @PrePersist
    protected void onCreate() {
        if (ngayTao == null) {
            ngayTao = LocalDate.now();
        }
    }
}