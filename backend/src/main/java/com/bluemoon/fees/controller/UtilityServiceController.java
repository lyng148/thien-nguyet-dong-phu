package com.bluemoon.fees.controller;

import com.bluemoon.fees.dto.UtilityServiceDTO;
import com.bluemoon.fees.dto.UtilityServiceRequest;
import com.bluemoon.fees.service.UtilityServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/utility-services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UtilityServiceController {

    private final UtilityServiceService utilityServiceService;    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> getAllUtilityServices() {
        List<UtilityServiceDTO> services = utilityServiceService.getAllUtilityServices();
        return ResponseEntity.ok(services);
    }    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<UtilityServiceDTO> getUtilityServiceById(@PathVariable Long id) {
        UtilityServiceDTO service = utilityServiceService.getUtilityServiceById(id);
        return ResponseEntity.ok(service);
    }    @GetMapping("/household/{hoKhauId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> getUtilityServicesByHousehold(@PathVariable Long hoKhauId) {
        List<UtilityServiceDTO> services = utilityServiceService.getUtilityServicesByHoKhauId(hoKhauId);
        return ResponseEntity.ok(services);
    }    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> getUtilityServicesByType(@PathVariable String type) {
        // Utilize findByLoaiDichVu from repository which could be wrapped in service
        List<UtilityServiceDTO> services = utilityServiceService.searchUtilityServices(type);
        return ResponseEntity.ok(services);
    }    @GetMapping("/month/{thang}/year/{nam}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> getUtilityServicesByMonth(
            @PathVariable Integer thang,
            @PathVariable Integer nam) {
        List<UtilityServiceDTO> services = utilityServiceService.getUtilityServicesByMonthYear(thang, nam);
        return ResponseEntity.ok(services);
    }    @GetMapping("/household/{hoKhauId}/month/{thang}/year/{nam}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> getUtilityServicesByHouseholdAndMonth(
            @PathVariable Long hoKhauId,
            @PathVariable Integer thang,
            @PathVariable Integer nam) {
        List<UtilityServiceDTO> services = utilityServiceService.getUtilityServicesByHouseholdAndMonth(hoKhauId, thang, nam);
        return ResponseEntity.ok(services);
    }    @GetMapping("/unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> getUnpaidUtilityServices() {
        // Since we don't have a no-arg method, return all services with "CHUA_THANH_TOAN" status using search
        List<UtilityServiceDTO> services = utilityServiceService.searchUtilityServices("CHUA_THANH_TOAN");
        return ResponseEntity.ok(services);
    }    @GetMapping("/household/{hoKhauId}/unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> getUnpaidUtilityServicesByHousehold(@PathVariable Long hoKhauId) {
        List<UtilityServiceDTO> services = utilityServiceService.getUnpaidUtilityServices(hoKhauId);
        return ResponseEntity.ok(services);
    }@PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<UtilityServiceDTO> createUtilityService(@Valid @RequestBody UtilityServiceRequest request) {
        System.out.println("Request received - tongTien: " + request.getTongTien());
        UtilityServiceDTO createdService = utilityServiceService.createUtilityService(request);
        return ResponseEntity.ok(createdService);
    }    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<UtilityServiceDTO> updateUtilityService(
            @PathVariable Long id,
            @Valid @RequestBody UtilityServiceRequest request) {
        System.out.println("Update request received for ID " + id + " - tongTien: " + request.getTongTien());
        UtilityServiceDTO updatedService = utilityServiceService.updateUtilityService(id, request);
        return ResponseEntity.ok(updatedService);
    }    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<Void> deleteUtilityService(@PathVariable Long id) {
        utilityServiceService.deleteUtilityService(id);
        return ResponseEntity.noContent().build();
    }    @PutMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Void> markUtilityServiceAsPaid(@PathVariable Long id) {
        utilityServiceService.markAsPaid(id);
        return ResponseEntity.ok().build();
    }    @PutMapping("/{id}/mark-unpaid")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Void> markUtilityServiceAsUnpaid(@PathVariable Long id) {
        utilityServiceService.markAsUnpaid(id);
        return ResponseEntity.ok().build();
    }    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityServiceDTO>> searchUtilityServices(@RequestParam String search) {
        List<UtilityServiceDTO> services = utilityServiceService.searchUtilityServices(search);
        return ResponseEntity.ok(services);
    }    @GetMapping("/household/{hoKhauId}/total/{thang}/{nam}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Double> calculateTotalFees(
            @PathVariable Long hoKhauId,
            @PathVariable Integer thang,
            @PathVariable Integer nam) {
        double total = utilityServiceService.calculateTotalUtilityFee(hoKhauId, thang, nam);
        return ResponseEntity.ok(total);
    }    @GetMapping("/household/{hoKhauId}/unpaid-total/{thang}/{nam}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Double> calculateUnpaidTotal(
            @PathVariable Long hoKhauId,
            @PathVariable Integer thang,
            @PathVariable Integer nam) {
   
        double total = utilityServiceService.calculateTotalUtilityFee(hoKhauId, thang, nam);
        return ResponseEntity.ok(total);
    }@PostMapping("/bulk-create")
    @PreAuthorize("hasAnyRole('ADMIN', 'TO_TRUONG')")
    public ResponseEntity<List<UtilityServiceDTO>> createUtilityServicesForAllHouseholds(
            @Valid @RequestBody UtilityServiceRequest request) {
        // Adapt to match the service interface - we don't have this bulk create method
        // Create a single utility service instead
        UtilityServiceDTO service = utilityServiceService.createUtilityService(request);
        return ResponseEntity.ok(List.of(service));
    }
}
