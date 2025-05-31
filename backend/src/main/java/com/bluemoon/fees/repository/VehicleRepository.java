package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    // Find vehicles by household ID
    List<Vehicle> findByHoKhauId(Long hoKhauId);
    
    // Find vehicle by license plate
    Optional<Vehicle> findByBienSoXe(String bienSoXe);
    
    // Check if license plate exists (excluding specific vehicle ID for updates)
    @Query("SELECT COUNT(v) > 0 FROM Vehicle v WHERE v.bienSoXe = :bienSoXe AND (:vehicleId IS NULL OR v.id != :vehicleId)")
    boolean existsByBienSoXeAndIdNot(@Param("bienSoXe") String bienSoXe, @Param("vehicleId") Long vehicleId);
    
    // Find vehicles by type
    List<Vehicle> findByLoaiXe(String loaiXe);
    
    // Count vehicles by household
    long countByHoKhauId(Long hoKhauId);
    
    // Find vehicles with household information
    @Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.hoKhau WHERE v.id = :id")
    Optional<Vehicle> findByIdWithHoKhau(@Param("id") Long id);
    
    // Find all vehicles with household information
    @Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.hoKhau")
    List<Vehicle> findAllWithHoKhau();
    
    // Search vehicles by license plate or household number
    @Query("SELECT v FROM Vehicle v LEFT JOIN FETCH v.hoKhau h " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "LOWER(v.bienSoXe) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.soHoKhau) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.chuHo) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Vehicle> searchVehicles(@Param("search") String search);
}
