package com.bluemoon.fees.dto;

import java.time.LocalDate;

import com.bluemoon.fees.entity.KhoanThu;
import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.NopPhi;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NopPhiDTO {
    private Long id;
    
    // HoKhau details
    private Long hoKhauId;
    private String chuHo;
    private String address;
    private String soHoKhau;
    
    // KhoanThu details
    private Long khoanThuId;
    private String tenKhoanThu;
    private Double soTienKhoanThu;
    
    // NopPhi details
    private LocalDate ngayNop;
    private String nguoiNop;
    private Double tongTien;
    private Double soTien;
    private boolean daXacNhan;
    private String ghiChu;
    
    // Constructor from NopPhi entity
    public NopPhiDTO(NopPhi nopPhi) {
        this.id = nopPhi.getId();
        
        if (nopPhi.getHoKhau() != null) {
            HoKhau hoKhau = nopPhi.getHoKhau();
            this.hoKhauId = hoKhau.getId();
            this.chuHo = hoKhau.getChuHo();
            this.address = hoKhau.getAddress();
            this.soHoKhau = hoKhau.getSoHoKhau();
        }
        
        if (nopPhi.getKhoanThu() != null) {
            KhoanThu khoanThu = nopPhi.getKhoanThu();
            this.khoanThuId = khoanThu.getId();
            this.tenKhoanThu = khoanThu.getTenKhoanThu();
            this.soTienKhoanThu = khoanThu.getSoTien();
        }
        
        this.ngayNop = nopPhi.getNgayNop();
        this.nguoiNop = nopPhi.getNguoiNop();
        this.tongTien = nopPhi.getTongTien();
        this.soTien = nopPhi.getSoTien();
        this.daXacNhan = nopPhi.isDaXacNhan();
        this.ghiChu = nopPhi.getGhiChu();
    }
    
    // Convert back to NopPhi entity
    public NopPhi toEntity() {
        NopPhi nopPhi = new NopPhi();
        nopPhi.setId(this.id);
        
        if (this.hoKhauId != null) {
            HoKhau hoKhau = new HoKhau();
            hoKhau.setId(this.hoKhauId);
            hoKhau.setChuHo(this.chuHo);
            hoKhau.setAddress(this.address);
            hoKhau.setSoHoKhau(this.soHoKhau);
            nopPhi.setHoKhau(hoKhau);
        }
        
        if (this.khoanThuId != null) {
            KhoanThu khoanThu = new KhoanThu();
            khoanThu.setId(this.khoanThuId);
            khoanThu.setTenKhoanThu(this.tenKhoanThu);
            khoanThu.setSoTien(this.soTienKhoanThu);
            nopPhi.setKhoanThu(khoanThu);
        }
        
        nopPhi.setNgayNop(this.ngayNop);
        nopPhi.setNguoiNop(this.nguoiNop);
        nopPhi.setTongTien(this.tongTien);
        nopPhi.setSoTien(this.soTien);
        nopPhi.setDaXacNhan(this.daXacNhan);
        nopPhi.setGhiChu(this.ghiChu);
        
        return nopPhi;
    }
}