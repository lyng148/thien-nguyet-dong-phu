package com.bluemoon.fees.controller;

import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.KhoanThu;
import com.bluemoon.fees.entity.NopPhi;
import com.bluemoon.fees.repository.HoKhauRepository;
import com.bluemoon.fees.repository.KhoanThuRepository;
import com.bluemoon.fees.service.NopPhiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments") // Keep original endpoint path
@RequiredArgsConstructor
@Slf4j
public class NopPhiController {

    private final NopPhiService nopPhiService;
    private final HoKhauRepository hoKhauRepository;
    private final KhoanThuRepository khoanThuRepository;

    @GetMapping
    public ResponseEntity<List<NopPhi>> getAllNopPhi() {
        log.info("Getting all payments");
        List<NopPhi> payments = nopPhiService.findAll();
        log.info("Found {} payments", payments.size());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NopPhi> getNopPhiById(@PathVariable Long id) {
        log.info("Getting payment with id: {}", id);
        NopPhi nopPhi = nopPhiService.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        log.info("Found payment: {}", nopPhi);
        return ResponseEntity.ok(nopPhi);
    }

    @GetMapping("/ho-khau/{hoKhauId}")
    public ResponseEntity<List<NopPhi>> getNopPhiByHoKhau(@PathVariable Long hoKhauId) {
        log.info("Getting payments for ho khau with id: {}", hoKhauId);
        List<NopPhi> payments = nopPhiService.findByHoKhau(hoKhauId);
        log.info("Found {} payments", payments.size());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/khoan-thu/{khoanThuId}")
    public ResponseEntity<List<NopPhi>> getNopPhiByKhoanThu(@PathVariable Long khoanThuId) {
        log.info("Getting payments for khoan thu with id: {}", khoanThuId);
        List<NopPhi> payments = nopPhiService.findByKhoanThu(khoanThuId);
        log.info("Found {} payments", payments.size());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<NopPhi>> getNopPhiByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting payments between {} and {}", startDate, endDate);
        List<NopPhi> payments = nopPhiService.findByDateRange(startDate, endDate);
        log.info("Found {} payments", payments.size());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/unverified")
    public ResponseEntity<List<NopPhi>> getUnverifiedNopPhi() {
        log.info("Getting unverified payments");
        List<NopPhi> payments = nopPhiService.findUnverifiedPayments();
        log.info("Found {} unverified payments", payments.size());
        return ResponseEntity.ok(payments);
    }

    @PostMapping
    public ResponseEntity<NopPhi> createNopPhi(@RequestBody NopPhi nopPhi) {
        log.info("Creating new payment: {}", nopPhi);
        
        // Validate and load household and fee
        if (nopPhi.getHoKhau() != null && nopPhi.getHoKhau().getId() != null) {
            HoKhau hoKhau = hoKhauRepository.findById(nopPhi.getHoKhau().getId())
                .orElseThrow(() -> new RuntimeException("Household not found with id: " + nopPhi.getHoKhau().getId()));
            nopPhi.setHoKhau(hoKhau);
        }
        
        if (nopPhi.getKhoanThu() != null && nopPhi.getKhoanThu().getId() != null) {
            KhoanThu khoanThu = khoanThuRepository.findById(nopPhi.getKhoanThu().getId())
                .orElseThrow(() -> new RuntimeException("Fee not found with id: " + nopPhi.getKhoanThu().getId()));
            nopPhi.setKhoanThu(khoanThu);
            
            // Set default values from the fee if not provided
            if (nopPhi.getTongTien() == null || nopPhi.getTongTien() <= 0) {
                nopPhi.setTongTien(khoanThu.getSoTien());
            }
            if (nopPhi.getSoTien() == null || nopPhi.getSoTien() <= 0) {
                nopPhi.setSoTien(khoanThu.getSoTien());
            }
        }
        
        if (nopPhi.getNgayNop() == null) {
            nopPhi.setNgayNop(LocalDate.now());
        }
        
        NopPhi created = nopPhiService.createNopPhi(nopPhi);
        log.info("Created payment with id: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NopPhi> updateNopPhi(@PathVariable Long id, @RequestBody NopPhi nopPhi) {
        log.info("Updating payment with id: {}", id);
        
        // Get existing payment
        NopPhi existing = nopPhiService.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        
        // Preserve HoKhau and KhoanThu references
        nopPhi.setId(id);
        nopPhi.setHoKhau(existing.getHoKhau());
        nopPhi.setKhoanThu(existing.getKhoanThu());
        
        // Update fields
        NopPhi updated = nopPhiService.updateNopPhi(id, nopPhi);
        log.info("Updated payment: {}", updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNopPhi(@PathVariable Long id) {
        log.info("Deleting payment with id: {}", id);
        
        // Check if payment exists
        if (!nopPhiService.existsById(id)) {
            log.warn("Payment with id {} not found for deletion", id);
            return ResponseEntity.notFound().build();
        }
        
        nopPhiService.deleteById(id);
        log.info("Payment deleted successfully");
        return ResponseEntity.ok().body(Map.of("message", "Payment deleted successfully"));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyNopPhi(@PathVariable Long id) {
        log.info("Verifying payment with id: {}", id);
        nopPhiService.verifyNopPhi(id);
        log.info("Payment verified successfully");
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unverify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> unverifyNopPhi(@PathVariable Long id) {
        log.info("Unverifying payment with id: {}", id);
        nopPhiService.unverifyNopPhi(id);
        log.info("Payment unverified successfully");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getNopPhiStatistics(
            @RequestParam(required = false) Long hoKhauId,
            @RequestParam(required = false) Long khoanThuId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting payment statistics with filters - hoKhauId: {}, khoanThuId: {}, startDate: {}, endDate: {}", 
                hoKhauId, khoanThuId, startDate, endDate);
        
        double totalAmount;
        String filterType;
        
        if (hoKhauId != null) {
            totalAmount = nopPhiService.calculateTotalPaymentsByHoKhau(hoKhauId);
            filterType = "hoKhau";
        } else if (khoanThuId != null) {
            totalAmount = nopPhiService.calculateTotalPaymentsByKhoanThu(khoanThuId);
            filterType = "khoanThu";
        } else if (startDate != null && endDate != null) {
            totalAmount = nopPhiService.calculateTotalPaymentsByDateRange(startDate, endDate);
            filterType = "dateRange";
        } else {
            // Default: total of all payments
            List<NopPhi> allPayments = nopPhiService.findAll();
            totalAmount = allPayments.stream().mapToDouble(NopPhi::getSoTien).sum();
            filterType = "all";
        }
        
        Map<String, Object> statistics = Map.of(
            "filterType", filterType,
            "totalAmount", totalAmount
        );
        
        log.info("Payment statistics: {}", statistics);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/ho-khau/{hoKhauId}/khoan-thu/{khoanThuId}")
    public ResponseEntity<?> getNopPhiByHoKhauAndKhoanThu(
            @PathVariable Long hoKhauId, 
            @PathVariable Long khoanThuId) {
        log.info("Checking if ho khau with id: {} has paid for khoan thu with id: {}", hoKhauId, khoanThuId);
        
        try {
            NopPhi payment = nopPhiService.findByHoKhauAndKhoanThu(hoKhauId, khoanThuId);
            log.info("Found payment: {}", payment);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            // In case no payment is found, return 404 Not Found
            log.info("No payment found for ho khau id: {} and khoan thu id: {}", hoKhauId, khoanThuId);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/household/{householdId}/fee/{feeId}")
    public ResponseEntity<?> getPaymentByHouseholdAndFee(
            @PathVariable Long householdId, 
            @PathVariable Long feeId) {
        log.info("Checking if household with id: {} has paid for fee with id: {}", householdId, feeId);
        
        try {
            NopPhi payment = nopPhiService.findByHoKhauAndKhoanThu(householdId, feeId);
            log.info("Found payment: {}", payment);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            // In case no payment is found, return 404 Not Found
            log.info("No payment found for household id: {} and fee id: {}", householdId, feeId);
            return ResponseEntity.notFound().build();
        }
    }
}