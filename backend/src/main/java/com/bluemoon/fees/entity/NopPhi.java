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

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "nop_phi")
@ToString(exclude = {"hoKhau", "khoanThu"})
@JsonIdentityInfo(
  generator = ObjectIdGenerators.PropertyGenerator.class, 
  property = "id",
  scope = NopPhi.class
)
public class NopPhi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "ho_khau_id", nullable = false)
    private HoKhau hoKhau;
    
    @ManyToOne
    @JoinColumn(name = "khoan_thu_id", nullable = false)
    private KhoanThu khoanThu;
    
    @Column(name = "nguoi_nop")
    private String nguoiNop;
    
    @Column(name = "ngay_nop", nullable = false)
    private LocalDate ngayNop;
    
    @Column(name = "tong_tien", nullable = false)
    private Double tongTien;
    
    @Column(name = "so_tien", nullable = false)
    private Double soTien = 0.0;
    
    @Column(name = "da_xac_nhan", nullable = false)
    private boolean daXacNhan = false;
    
    @Column(name = "ghi_chu")
    private String ghiChu;
}