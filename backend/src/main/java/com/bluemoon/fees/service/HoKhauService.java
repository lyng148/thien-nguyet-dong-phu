package com.bluemoon.fees.service;

import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.NhanKhau;
import java.util.List;

public interface HoKhauService extends BaseService<HoKhau, Long> {
    List<HoKhau> findAllActive();
    HoKhau findActiveById(Long id);
    List<HoKhau> searchByChuHo(String chuHo);
    List<HoKhau> searchByAddress(String address);
    HoKhau findBySoHoKhau(String soHoKhau);
    HoKhau createHoKhau(HoKhau hoKhau);
    HoKhau updateHoKhau(Long id, HoKhau hoKhau);
    void deactivateHoKhau(Long id);
    void activateHoKhau(Long id);
    
    // New methods for managing NhanKhau in HoKhau
    HoKhau addNhanKhauToHoKhau(Long hoKhauId, Long nhanKhauId, String quanHeVoiChuHo, String ghiChu);
    HoKhau removeNhanKhauFromHoKhau(Long hoKhauId, Long nhanKhauId, String ghiChu);
    List<NhanKhau> getNhanKhauInHoKhau(Long hoKhauId);
}