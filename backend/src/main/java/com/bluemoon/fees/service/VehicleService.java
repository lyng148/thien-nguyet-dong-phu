package com.bluemoon.fees.service;

import com.bluemoon.fees.dto.VehicleDTO;
import com.bluemoon.fees.dto.VehicleRequest;
import com.bluemoon.fees.dto.HouseholdVehicleFeeDTO;
import com.bluemoon.fees.entity.Vehicle;

import java.util.List;

public interface VehicleService {
    
    List<VehicleDTO> getAllVehicles();
    
    List<VehicleDTO> getVehiclesByHoKhauId(Long hoKhauId);
    
    VehicleDTO getVehicleById(Long id);
    
    VehicleDTO createVehicle(VehicleRequest request);
    
    VehicleDTO updateVehicle(Long id, VehicleRequest request);
    
    void deleteVehicle(Long id);
    
    boolean checkLicensePlateUnique(String bienSoXe, Long vehicleId);
    
    List<VehicleDTO> searchVehicles(String search);
    
    double calculateMonthlyParkingFee(Long hoKhauId);
    
    long countVehiclesByType(String loaiXe);
    
    HouseholdVehicleFeeDTO getHouseholdVehicleFeeDetails(Long hoKhauId);
}
