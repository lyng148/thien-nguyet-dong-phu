package com.bluemoon.fees.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Long id;
    private String bienSoXe;
    private String loaiXe;
    private String hangXe;
    private String mauXe;
    private Integer namSanXuat;
    private String mauSac;
    private String ghiChu;
    private Long hoKhauId;
    private String soHoKhau;
    private String chuHo;
    
    // For vehicle fee calculation
    private Double monthlyFee;
}
