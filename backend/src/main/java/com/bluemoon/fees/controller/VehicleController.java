package com.bluemoon.fees.controller;

import com.bluemoon.fees.dto.VehicleDTO;
import com.bluemoon.fees.dto.VehicleRequest;
import com.bluemoon.fees.dto.HouseholdVehicleFeeDTO;
import com.bluemoon.fees.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
@Slf4j
public class VehicleController {
    
    private final VehicleService vehicleService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<VehicleDTO>> getAllVehicles(
            @RequestParam(required = false) String search) {
        try {
            List<VehicleDTO> vehicles;
            if (search != null && !search.trim().isEmpty()) {
                vehicles = vehicleService.searchVehicles(search.trim());
            } else {
                vehicles = vehicleService.getAllVehicles();
            }
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            log.error("Error getting vehicles: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/household/{hoKhauId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<VehicleDTO>> getVehiclesByHousehold(@PathVariable Long hoKhauId) {
        try {
            List<VehicleDTO> vehicles = vehicleService.getVehiclesByHoKhauId(hoKhauId);
            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            log.error("Error getting vehicles for household {}: ", hoKhauId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<VehicleDTO> getVehicleById(@PathVariable Long id) {
        try {
            VehicleDTO vehicle = vehicleService.getVehicleById(id);
            return ResponseEntity.ok(vehicle);
        } catch (RuntimeException e) {
            log.error("Vehicle not found with id {}: ", id, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting vehicle {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<?> createVehicle(@Valid @RequestBody VehicleRequest request) {
        try {
            VehicleDTO createdVehicle = vehicleService.createVehicle(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
        } catch (RuntimeException e) {
            log.error("Error creating vehicle: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Unexpected error creating vehicle: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        try {
            VehicleDTO updatedVehicle = vehicleService.updateVehicle(id, request);
            return ResponseEntity.ok(updatedVehicle);
        } catch (RuntimeException e) {
            log.error("Error updating vehicle {}: ", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Unexpected error updating vehicle {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa xe thành công");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error deleting vehicle {}: ", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Unexpected error deleting vehicle {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/check-license-plate")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<Map<String, Boolean>> checkLicensePlateUnique(
            @RequestParam String bienSoXe,
            @RequestParam(required = false) Long vehicleId) {
        try {
            boolean isUnique = vehicleService.checkLicensePlateUnique(bienSoXe, vehicleId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("isUnique", isUnique);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking license plate uniqueness: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/household/{hoKhauId}/parking-fee")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Map<String, Double>> calculateParkingFee(@PathVariable Long hoKhauId) {
        try {
            double fee = vehicleService.calculateMonthlyParkingFee(hoKhauId);
            Map<String, Double> response = new HashMap<>();
            response.put("monthlyParkingFee", fee);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error calculating parking fee for household {}: ", hoKhauId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Map<String, Object>> getVehicleStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("totalVehicles", vehicleService.getAllVehicles().size());
            statistics.put("motorcycles", vehicleService.countVehiclesByType("XE_MAY"));
            statistics.put("cars", vehicleService.countVehiclesByType("OTO"));
            
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting vehicle statistics: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/household/{hoKhauId}/fee-details")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<HouseholdVehicleFeeDTO> getHouseholdVehicleFeeDetails(@PathVariable Long hoKhauId) {
        try {
            HouseholdVehicleFeeDTO feeDetails = vehicleService.getHouseholdVehicleFeeDetails(hoKhauId);
            return ResponseEntity.ok(feeDetails);
        } catch (RuntimeException e) {
            log.error("Household not found with id {}: ", hoKhauId, e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting household vehicle fee details for {}: ", hoKhauId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
