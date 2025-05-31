package com.bluemoon.fees.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    
    @NotBlank(message = "Biển số xe không được để trống")
    private String bienSoXe;
    
    @NotBlank(message = "Loại xe không được để trống")
    private String loaiXe;
    
    private String hangXe;
    private String mauXe;
    private Integer namSanXuat;
    private String mauSac;
    private String ghiChu;
    
    @NotNull(message = "ID hộ khẩu không được để trống")
    private Long hoKhauId;
}
