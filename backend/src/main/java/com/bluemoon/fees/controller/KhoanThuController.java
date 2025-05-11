package com.bluemoon.fees.controller;

import com.bluemoon.fees.entity.KhoanThu;
import com.bluemoon.fees.service.KhoanThuService;
import com.bluemoon.fees.service.NopPhiService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/fees") // Keep original endpoint path
@RequiredArgsConstructor
public class KhoanThuController {

    private final KhoanThuService khoanThuService;
    private final NopPhiService nopPhiService;

    @GetMapping
    public ResponseEntity<List<KhoanThu>> getAllKhoanThu(
            @RequestParam(required = false, defaultValue = "false") boolean showAll) {
        if (showAll) {
            return ResponseEntity.ok(khoanThuService.findAll());
        } else {
            return ResponseEntity.ok(khoanThuService.findAllActive());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<KhoanThu> getKhoanThuById(@PathVariable Long id) {
        return ResponseEntity.ok(khoanThuService.findById(id)
                .orElseThrow(() -> new RuntimeException("Khoan thu not found with id: " + id)));
    }

    @GetMapping("/bat-buoc/{batBuoc}")
    public ResponseEntity<List<KhoanThu>> getKhoanThuByBatBuoc(@PathVariable Boolean batBuoc) {
        return ResponseEntity.ok(khoanThuService.findByBatBuoc(batBuoc));
    }

    @GetMapping("/thoi-han-range")
    public ResponseEntity<List<KhoanThu>> getKhoanThuByThoiHanRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(khoanThuService.findByThoiHanRange(startDate, endDate));
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<KhoanThu>> getOverdueKhoanThu() {
        return ResponseEntity.ok(khoanThuService.findOverdueKhoanThu());
    }

    @PostMapping
    public ResponseEntity<KhoanThu> createKhoanThu(@RequestBody KhoanThu khoanThu) {
        return ResponseEntity.ok(khoanThuService.createKhoanThu(khoanThu));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<KhoanThu> updateKhoanThu(@PathVariable Long id, @RequestBody KhoanThu khoanThu) {
        return ResponseEntity.ok(khoanThuService.updateKhoanThu(id, khoanThu));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteKhoanThu(@PathVariable Long id) {
        khoanThuService.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateKhoanThu(@PathVariable Long id) {
        khoanThuService.activateKhoanThu(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleKhoanThuStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> statusMap) {
        boolean hoatDong = statusMap.getOrDefault("hoatDong", false);
        if (hoatDong) {
            khoanThuService.activateKhoanThu(id);
        } else {
            khoanThuService.deactivateKhoanThu(id);
        }
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getKhoanThuStatistics(@PathVariable Long id) {
        // Ensure the khoanThu exists
        KhoanThu khoanThu = khoanThuService.findById(id)
                .orElseThrow(() -> new RuntimeException("Khoan thu not found with id: " + id));
        
        // Get payment statistics
        double totalCollected = nopPhiService.calculateTotalPaymentsByKhoanThu(id);
        long totalPayments = nopPhiService.findByKhoanThu(id).size();
        
        Map<String, Object> statistics = Map.of(
            "totalPayments", totalPayments,
            "totalCollected", totalCollected,
            "soTien", khoanThu.getSoTien(),
            "tenKhoanThu", khoanThu.getTenKhoanThu()
        );
        
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/{id}/paid-households")
    public ResponseEntity<Map<String, Object>> getHouseholdsPaidForFee(@PathVariable Long id) {
        // Ensure the khoanThu exists
        KhoanThu khoanThu = khoanThuService.findById(id)
                .orElseThrow(() -> new RuntimeException("Khoan thu not found with id: " + id));
        
        // Get households that have paid
        List<Map<String, Object>> paidHouseholds = nopPhiService.getHouseholdsPaidForFee(id);
        
        // Get statistics
        double totalCollected = nopPhiService.calculateTotalPaymentsByKhoanThu(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("feeId", khoanThu.getId());
        response.put("feeName", khoanThu.getTenKhoanThu());
        response.put("feeAmount", khoanThu.getSoTien());
        response.put("dueDate", khoanThu.getThoiHan());
        response.put("totalCollected", totalCollected);
        response.put("totalPaidHouseholds", paidHouseholds.size());
        response.put("paidHouseholds", paidHouseholds);
        
        return ResponseEntity.ok(response);
    }
}