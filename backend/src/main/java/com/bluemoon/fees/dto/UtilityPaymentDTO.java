package com.bluemoon.fees.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilityPaymentDTO {
    private Long id;
    private Long hoKhauId;
    private String soHoKhau;
    private String chuHo;    private Long utilityServiceId;
    private String loaiDichVu;
    private Integer thang;
    private Integer nam;
    private Double soTienThanhToan;
    private Double phiGuiXe;
    private Double phiDichVu;
    private LocalDate ngayThanhToan;
    private String phuongThucThanhToan;
    private String maGiaoDich;
    private String nguoiThu;
    private String trangThai;
    private String ghiChu;
    private LocalDateTime createdAt;
}
