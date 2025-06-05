package com.bluemoon.fees.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilityServiceDTO {
    private Long id;
    private Long hoKhauId;
    private String soHoKhau;
    private String chuHo;
    private String loaiDichVu;
    private Integer thang;
    private Integer nam;
    private Double chiSoCu;
    private Double chiSoMoi;
    private Double soLuongSuDung;
    private Double donGia;
    private Double phiCoDinh;
    private Double tongTien;
    private String trangThai;
    private LocalDateTime ngayGhiNhan;
    private String ghiChu;
    private String donViTinh;
    
    // Helper method to get service type display name
    public String getLoaiDichVuDisplayName() {
        switch (loaiDichVu) {
            case "DIEN": return "Điện";
            case "NUOC": return "Nước";
            case "INTERNET": return "Internet";
            case "GAS": return "Gas";
            case "VE_SINH": return "Vệ sinh";
            case "BAO_VE": return "Bảo vệ";
            default: return loaiDichVu;
        }
    }
}
