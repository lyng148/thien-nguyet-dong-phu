package com.bluemoon.fees.service;

import com.bluemoon.fees.dto.UtilityPaymentDTO;
import com.bluemoon.fees.dto.UtilityPaymentRequest;

import java.time.LocalDate;
import java.util.List;

public interface UtilityPaymentService {
    
    List<UtilityPaymentDTO> getAllUtilityPayments();
    
    List<UtilityPaymentDTO> getUtilityPaymentsByHoKhauId(Long hoKhauId);
    

    List<UtilityPaymentDTO> getUtilityPaymentsByDateRange(LocalDate startDate, LocalDate endDate);
    
    List<UtilityPaymentDTO> getUtilityPaymentsByHouseholdAndMonth(Long hoKhauId, Integer thang, Integer nam);
    
    UtilityPaymentDTO getUtilityPaymentById(Long id);
    
    UtilityPaymentDTO createUtilityPayment(UtilityPaymentRequest request);
    
    UtilityPaymentDTO updateUtilityPayment(Long id, UtilityPaymentRequest request);
    
    void deleteUtilityPayment(Long id);
    
    void cancelUtilityPayment(Long id, String reason);
    
    List<UtilityPaymentDTO> searchUtilityPayments(String search);
    
    double calculateTotalPaid(Long hoKhauId, Integer thang, Integer nam);
    
    UtilityPaymentDTO findByTransactionCode(String maGiaoDich);
    
    String generateTransactionCode();
}
