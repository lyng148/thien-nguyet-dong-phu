package com.bluemoon.fees.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdVehicleFeeDTO {
    private Long hoKhauId;
    private String soHoKhau;
    private String chuHo;
    private List<VehicleDTO> vehicles;
    private double totalMonthlyFee;
    private int totalVehicleCount;
    private int motorcycleCount;
    private int carCount;
}
