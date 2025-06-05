package com.bluemoon.fees.repository;

import com.bluemoon.fees.entity.UtilityPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UtilityPaymentRepository extends JpaRepository<UtilityPayment, Long> {
    
    // Find utility payments by household ID
    List<UtilityPayment> findByHoKhauId(Long hoKhauId);
    
    // Find utility payments by utility service ID
    List<UtilityPayment> findByUtilityServiceId(Long utilityServiceId);
    
    // Find utility payments by household and month/year
    List<UtilityPayment> findByHoKhauIdAndThangAndNam(Long hoKhauId, Integer thang, Integer nam);
    
    // Find utility payments by payment date range
    List<UtilityPayment> findByNgayThanhToanBetween(LocalDate startDate, LocalDate endDate);
    
    // Find utility payments by payment method
    List<UtilityPayment> findByPhuongThucThanhToan(String phuongThucThanhToan);
    
    // Find utility payments by status
    List<UtilityPayment> findByTrangThai(String trangThai);
    
    // Find utility payments with household and utility service information
    @Query("SELECT up FROM UtilityPayment up LEFT JOIN FETCH up.hoKhau LEFT JOIN FETCH up.utilityService WHERE up.id = :id")
    Optional<UtilityPayment> findByIdWithDetails(@Param("id") Long id);
    
    // Find all utility payments with household and utility service information
    @Query("SELECT up FROM UtilityPayment up LEFT JOIN FETCH up.hoKhau LEFT JOIN FETCH up.utilityService")
    List<UtilityPayment> findAllWithDetails();
    
    // Search utility payments
    @Query("SELECT up FROM UtilityPayment up LEFT JOIN FETCH up.hoKhau h LEFT JOIN FETCH up.utilityService us " +
           "WHERE (:search IS NULL OR :search = '' OR " +
           "LOWER(h.soHoKhau) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(h.chuHo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(us.loaiDichVu) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(up.maGiaoDich) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<UtilityPayment> searchUtilityPayments(@Param("search") String search);
    
    // Calculate total payment amount for household by month/year
    @Query("SELECT COALESCE(SUM(up.soTienThanhToan), 0) FROM UtilityPayment up WHERE up.hoKhauId = :hoKhauId AND up.thang = :thang AND up.nam = :nam AND up.trangThai = 'DA_THANH_TOAN'")
    Double calculateTotalPaidByHouseholdAndMonth(@Param("hoKhauId") Long hoKhauId, @Param("thang") Integer thang, @Param("nam") Integer nam);
    
    // Find payments by transaction code
    Optional<UtilityPayment> findByMaGiaoDich(String maGiaoDich);
}
