package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.UtilityService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilityServiceRepository extends JpaRepository<UtilityService, Long> {
    
    // Find utility services by household ID
    List<UtilityService> findByHoKhauId(Long hoKhauId);
    
    // Find utility services by household and month/year
    List<UtilityService> findByHoKhauIdAndThangAndNam(Long hoKhauId, Integer thang, Integer nam);
    
    // Find utility services by service type
    List<UtilityService> findByLoaiDichVu(String loaiDichVu);
    
    // Find utility services by month and year
    List<UtilityService> findByThangAndNam(Integer thang, Integer nam);
    
    // Find utility services by payment status
    List<UtilityService> findByTrangThai(String trangThai);
    
    // Check if utility service exists for household, service type, month, year
    @Query("SELECT COUNT(u) > 0 FROM UtilityService u WHERE u.hoKhauId = :hoKhauId AND u.loaiDichVu = :loaiDichVu AND u.thang = :thang AND u.nam = :nam AND (:utilityId IS NULL OR u.id != :utilityId)")
    boolean existsByHoKhauIdAndLoaiDichVuAndThangAndNamAndIdNot(
        @Param("hoKhauId") Long hoKhauId, 
        @Param("loaiDichVu") String loaiDichVu, 
        @Param("thang") Integer thang, 
        @Param("nam") Integer nam, 
        @Param("utilityId") Long utilityId
    );
    
    // Find utility services with household information
    @Query("SELECT u FROM UtilityService u LEFT JOIN FETCH u.hoKhau WHERE u.id = :id")
    Optional<UtilityService> findByIdWithHoKhau(@Param("id") Long id);
    
    // Find all utility services with household information
    @Query("SELECT u FROM UtilityService u LEFT JOIN FETCH u.hoKhau")
    List<UtilityService> findAllWithHoKhau();
    
    // Search utility services
    @Query("SELECT u FROM UtilityService u LEFT JOIN FETCH u.hoKhau h " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "LOWER(h.soHoKhau) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.chuHo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.loaiDichVu) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<UtilityService> searchUtilityServices(@Param("search") String search);
    
    // Calculate total amount for household by month/year
    @Query("SELECT COALESCE(SUM(u.tongTien), 0) FROM UtilityService u WHERE u.hoKhauId = :hoKhauId AND u.thang = :thang AND u.nam = :nam")
    Double calculateTotalUtilityFeeByHouseholdAndMonth(@Param("hoKhauId") Long hoKhauId, @Param("thang") Integer thang, @Param("nam") Integer nam);
    
    // Find unpaid utility services for household
    @Query("SELECT u FROM UtilityService u WHERE u.hoKhauId = :hoKhauId AND u.trangThai = 'CHUA_THANH_TOAN'")
    List<UtilityService> findUnpaidUtilityServicesByHousehold(@Param("hoKhauId") Long hoKhauId);
}
