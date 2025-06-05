package com.bluemoon.fees.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilityServiceRequest {
    
    @NotNull(message = "ID hộ khẩu không được để trống")
    private Long hoKhauId;
    
    @NotBlank(message = "Loại dịch vụ không được để trống")
    private String loaiDichVu;
    
    @NotNull(message = "Tháng không được để trống")
    @Min(value = 1, message = "Tháng phải từ 1-12")
    private Integer thang;
    
    @NotNull(message = "Năm không được để trống")
    private Integer nam;
    
    // For metered services
    private Double chiSoCu;
    private Double chiSoMoi;
    private Double donGia;
    
    // For fixed services
    private Double phiCoDinh;
      // For manual entry
    private Double tongTien;
    
    // Alternative field name for frontend compatibility
    private Double soTien;
    
    private String ghiChu;
    
    private String donViTinh;
    
    // Helper method to get the amount value (prioritize soTien over tongTien)
    public Double getAmount() {
        if (soTien != null && soTien > 0) {
            return soTien;
        }
        return tongTien;
    }
}
