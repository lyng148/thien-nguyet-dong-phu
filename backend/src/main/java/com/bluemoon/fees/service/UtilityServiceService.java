package com.bluemoon.fees.service;

import com.bluemoon.fees.dto.UtilityServiceDTO;
import com.bluemoon.fees.dto.UtilityServiceRequest;

import java.util.List;

public interface UtilityServiceService {
    
    List<UtilityServiceDTO> getAllUtilityServices();
    
    List<UtilityServiceDTO> getUtilityServicesByHoKhauId(Long hoKhauId);
    
    List<UtilityServiceDTO> getUtilityServicesByMonthYear(Integer thang, Integer nam);
    
    List<UtilityServiceDTO> getUtilityServicesByHouseholdAndMonth(Long hoKhauId, Integer thang, Integer nam);
    
    UtilityServiceDTO getUtilityServiceById(Long id);
    
    UtilityServiceDTO createUtilityService(UtilityServiceRequest request);
    
    UtilityServiceDTO updateUtilityService(Long id, UtilityServiceRequest request);
    
    void deleteUtilityService(Long id);
    
    boolean checkUtilityServiceExists(Long hoKhauId, String loaiDichVu, Integer thang, Integer nam, Long utilityId);
    
    List<UtilityServiceDTO> searchUtilityServices(String search);
    
    double calculateTotalUtilityFee(Long hoKhauId, Integer thang, Integer nam);
    
    List<UtilityServiceDTO> getUnpaidUtilityServices(Long hoKhauId);
    
    void markAsPaid(Long utilityServiceId);
    
    void markAsUnpaid(Long utilityServiceId);
}
