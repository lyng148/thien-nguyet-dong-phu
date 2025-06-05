package com.bluemoon.fees.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilityPaymentRequest {
    
    @NotNull(message = "ID hộ khẩu không được để trống")
    private Long hoKhauId;
    
    @NotNull(message = "ID dịch vụ không được để trống")
    private Long utilityServiceId;
    
    @NotNull(message = "Số tiền thanh toán không được để trống")
    @Min(value = 0, message = "Số tiền thanh toán phải lớn hơn 0")
    private Double soTienThanhToan;
    
    private LocalDate ngayThanhToan;
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String phuongThucThanhToan;
    
    private String maGiaoDich;
    private String nguoiThu;
    private String ghiChu;
}
