package com.bluemoon.fees.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoKhauNhanKhauRequest {
    private Long hoKhauId;
    private Long nhanKhauId;
    private String quanHeVoiChuHo;
    private String ghiChu;
}