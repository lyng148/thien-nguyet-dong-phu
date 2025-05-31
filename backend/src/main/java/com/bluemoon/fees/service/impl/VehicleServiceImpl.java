package com.bluemoon.fees.service.impl;

import com.bluemoon.fees.dto.VehicleDTO;
import com.bluemoon.fees.dto.VehicleRequest;
import com.bluemoon.fees.dto.HouseholdVehicleFeeDTO;
import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.Vehicle;
import com.bluemoon.fees.repository.HoKhauRepository;
import com.bluemoon.fees.repository.VehicleRepository;
import com.bluemoon.fees.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class VehicleServiceImpl implements VehicleService {
    
    private final VehicleRepository vehicleRepository;
    private final HoKhauRepository hoKhauRepository;
    
    // Vehicle type fees (VND per month)
    private static final double XE_MAY_FEE = 70000.0;  // Motorcycle: 70,000 VND/month
    private static final double OTO_FEE = 1200000.0;   // Car: 1,200,000 VND/month
    
    @Override
    @Transactional(readOnly = true)
    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAllWithHoKhau().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<VehicleDTO> getVehiclesByHoKhauId(Long hoKhauId) {
        return vehicleRepository.findByHoKhauId(hoKhauId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }    @Override
    @Transactional(readOnly = true)
    public VehicleDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findByIdWithHoKhau(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + id));
        return convertToDTO(vehicle);
    }
    
    @Override
    public VehicleDTO createVehicle(VehicleRequest request) {
        // Validate household exists
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));          // Check license plate uniqueness
        if (!checkLicensePlateUnique(request.getBienSoXe(), null)) {
            throw new RuntimeException("Biển số xe đã tồn tại trong hệ thống");
        }
        
        Vehicle vehicle = new Vehicle();
        vehicle.setBienSoXe(request.getBienSoXe());
        vehicle.setLoaiXe(request.getLoaiXe());
        vehicle.setHangXe(request.getHangXe());
        vehicle.setMauXe(request.getMauXe());
        vehicle.setNamSanXuat(request.getNamSanXuat());
        vehicle.setMauSac(request.getMauSac());
        vehicle.setGhiChu(request.getGhiChu());
        vehicle.setHoKhauId(request.getHoKhauId());
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return convertToDTO(savedVehicle);
    }
    
    @Override
    public VehicleDTO updateVehicle(Long id, VehicleRequest request) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + id));
        
        // Validate household exists
        HoKhau hoKhau = hoKhauRepository.findById(request.getHoKhauId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + request.getHoKhauId()));
        
        // Check license plate uniqueness (excluding current vehicle)
        if (!checkLicensePlateUnique(request.getBienSoXe(), id)) {
            throw new RuntimeException("Biển số xe đã tồn tại trong hệ thống");
        }
        
        existingVehicle.setBienSoXe(request.getBienSoXe());
        existingVehicle.setLoaiXe(request.getLoaiXe());
        existingVehicle.setHangXe(request.getHangXe());
        existingVehicle.setMauXe(request.getMauXe());
        existingVehicle.setNamSanXuat(request.getNamSanXuat());
        existingVehicle.setMauSac(request.getMauSac());
        existingVehicle.setGhiChu(request.getGhiChu());
        existingVehicle.setHoKhauId(request.getHoKhauId());
        
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        return convertToDTO(updatedVehicle);
    }
    
    @Override
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với ID: " + id));
        vehicleRepository.delete(vehicle);
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean checkLicensePlateUnique(String bienSoXe, Long vehicleId) {
        return !vehicleRepository.existsByBienSoXeAndIdNot(bienSoXe, vehicleId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<VehicleDTO> searchVehicles(String search) {
        return vehicleRepository.searchVehicles(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public double calculateMonthlyParkingFee(Long hoKhauId) {
        List<Vehicle> vehicles = vehicleRepository.findByHoKhauId(hoKhauId);
        double totalFee = 0.0;
        
        for (Vehicle vehicle : vehicles) {
            if ("XE_MAY".equals(vehicle.getLoaiXe())) {
                totalFee += XE_MAY_FEE;
            } else if ("OTO".equals(vehicle.getLoaiXe())) {
                totalFee += OTO_FEE;
            }
        }
        
        return totalFee;
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countVehiclesByType(String loaiXe) {
        return vehicleRepository.findByLoaiXe(loaiXe).size();
    }
    
    @Override
    @Transactional(readOnly = true)
    public HouseholdVehicleFeeDTO getHouseholdVehicleFeeDetails(Long hoKhauId) {
        // Get household information
        HoKhau hoKhau = hoKhauRepository.findById(hoKhauId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hộ khẩu với ID: " + hoKhauId));
        
        // Get vehicles for this household
        List<VehicleDTO> vehicles = getVehiclesByHoKhauId(hoKhauId);
        
        // Calculate statistics
        int motorcycleCount = 0;
        int carCount = 0;
        double totalFee = 0.0;
        
        for (VehicleDTO vehicle : vehicles) {
            if ("XE_MAY".equals(vehicle.getLoaiXe())) {
                motorcycleCount++;
                totalFee += XE_MAY_FEE;
            } else if ("OTO".equals(vehicle.getLoaiXe())) {
                carCount++;
                totalFee += OTO_FEE;
            }
        }
        
        return new HouseholdVehicleFeeDTO(
                hoKhauId,
                hoKhau.getSoHoKhau(),
                hoKhau.getChuHo(),
                vehicles,
                totalFee,
                vehicles.size(),
                motorcycleCount,
                carCount
        );
    }
    
    private VehicleDTO convertToDTO(Vehicle vehicle) {
        VehicleDTO dto = new VehicleDTO();
        dto.setId(vehicle.getId());
        dto.setBienSoXe(vehicle.getBienSoXe());
        dto.setLoaiXe(vehicle.getLoaiXe());
        dto.setHangXe(vehicle.getHangXe());
        dto.setMauXe(vehicle.getMauXe());
        dto.setNamSanXuat(vehicle.getNamSanXuat());
        dto.setMauSac(vehicle.getMauSac());
        dto.setGhiChu(vehicle.getGhiChu());
        dto.setHoKhauId(vehicle.getHoKhauId());
        
        // Set household information if available
        if (vehicle.getHoKhau() != null) {
            dto.setSoHoKhau(vehicle.getHoKhau().getSoHoKhau());
            dto.setChuHo(vehicle.getHoKhau().getChuHo());
        }
        
        // Calculate monthly fee based on vehicle type
        if ("XE_MAY".equals(vehicle.getLoaiXe())) {
            dto.setMonthlyFee(XE_MAY_FEE);
        } else if ("OTO".equals(vehicle.getLoaiXe())) {
            dto.setMonthlyFee(OTO_FEE);
        } else {
            dto.setMonthlyFee(0.0);
        }
        
        return dto;
    }
}
