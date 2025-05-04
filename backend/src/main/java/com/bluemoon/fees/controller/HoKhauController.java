package com.bluemoon.fees.controller;

import com.bluemoon.fees.entity.HoKhau;
import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.entity.NopPhi;
import com.bluemoon.fees.dto.HoKhauNhanKhauRequest;
import com.bluemoon.fees.service.HoKhauService;
import com.bluemoon.fees.service.NopPhiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/households") // Keep original endpoint path
@RequiredArgsConstructor
@Slf4j
public class HoKhauController {

    private final HoKhauService hoKhauService;
    private final NopPhiService nopPhiService;

    @GetMapping
    public ResponseEntity<List<HoKhau>> getAllHoKhau(
            @RequestParam(required = false, defaultValue = "false") boolean showAll) {
        List<HoKhau> hoKhauList;
        if (showAll) {
            log.info("Getting all ho khau (including inactive)");
            hoKhauList = hoKhauService.findAll();
            log.info("Found {} ho khau", hoKhauList.size());
        } else {
            log.info("Getting all active ho khau");
            hoKhauList = hoKhauService.findAllActive();
            log.info("Found {} active ho khau", hoKhauList.size());
        }
        return ResponseEntity.ok(hoKhauList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoKhau> getHoKhauById(@PathVariable Long id) {
        log.info("Getting ho khau with id: {}", id);
        HoKhau hoKhau = hoKhauService.findById(id)
                .orElseThrow(() -> new RuntimeException("Ho khau not found with id: " + id));
        log.info("Found ho khau: {}", hoKhau);
        return ResponseEntity.ok(hoKhau);
    }

    @GetMapping("/so-ho-khau/{soHoKhau}")
    public ResponseEntity<HoKhau> getHoKhauBySoHoKhau(@PathVariable String soHoKhau) {
        log.info("Getting ho khau with so ho khau: {}", soHoKhau);
        HoKhau hoKhau = hoKhauService.findBySoHoKhau(soHoKhau);
        log.info("Found ho khau: {}", hoKhau);
        return ResponseEntity.ok(hoKhau);
    }

    @GetMapping("/search")
    public ResponseEntity<List<HoKhau>> searchHoKhau(
            @RequestParam(required = false) String chuHo,
            @RequestParam(required = false) String address,
            @RequestParam(required = false, defaultValue = "false") boolean showAll) {
        log.info("Searching ho khau with chuHo: {}, address: {}, showAll: {}", chuHo, address, showAll);
        List<HoKhau> hoKhauList;
        
        if (chuHo != null && !chuHo.isEmpty()) {
            hoKhauList = hoKhauService.searchByChuHo(chuHo);
            log.info("Found {} ho khau by chu ho", hoKhauList.size());
        } else if (address != null && !address.isEmpty()) {
            hoKhauList = hoKhauService.searchByAddress(address);
            log.info("Found {} ho khau by address", hoKhauList.size());
        } else {
            if (showAll) {
                hoKhauList = hoKhauService.findAll();
                log.info("No search parameters, returning all {} ho khau", hoKhauList.size());
            } else {
                hoKhauList = hoKhauService.findAllActive();
                log.info("No search parameters, returning all {} active ho khau", hoKhauList.size());
            }
        }
        
        return ResponseEntity.ok(hoKhauList);
    }

    @PostMapping
    public ResponseEntity<HoKhau> createHoKhau(@RequestBody HoKhau hoKhau) {
        log.info("Creating new ho khau: {}", hoKhau);
        HoKhau created = hoKhauService.createHoKhau(hoKhau);
        log.info("Created ho khau with id: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HoKhau> updateHoKhau(@PathVariable Long id, @RequestBody HoKhau hoKhau) {
        log.info("Updating ho khau with id: {}", id);
        HoKhau updated = hoKhauService.updateHoKhau(id, hoKhau);
        log.info("Updated ho khau: {}", updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateHoKhau(@PathVariable Long id) {
        log.info("Handling delete request for ho khau with id: {}", id);
        
        // Check if the ho khau is already inactive
        HoKhau hoKhau = hoKhauService.findById(id)
                .orElseThrow(() -> new RuntimeException("Ho khau not found with id: " + id));
        
        if (hoKhau.isHoatDong()) {
            // If active, just deactivate it
            log.info("Deactivating active ho khau with id: {}", id);
            hoKhauService.deactivateHoKhau(id);
            log.info("Ho khau deactivated successfully");
        } else {
            // If already inactive, permanently delete it
            log.info("Permanently deleting inactive ho khau with id: {}", id);
            hoKhauService.deleteById(id);
            log.info("Ho khau permanently deleted");
        }
        
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> activateHoKhau(@PathVariable Long id) {
        log.info("Activating ho khau with id: {}", id);
        hoKhauService.activateHoKhau(id);
        log.info("Ho khau activated successfully");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<NopPhi>> getHoKhauPayments(@PathVariable Long id) {
        log.info("Getting payments for ho khau with id: {}", id);
        List<NopPhi> payments = nopPhiService.findByHoKhau(id);
        log.info("Found {} payments", payments.size());
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getHoKhauStatistics(@PathVariable Long id) {
        log.info("Getting statistics for ho khau with id: {}", id);
        
        // Ensure the ho khau exists
        hoKhauService.findById(id)
                .orElseThrow(() -> new RuntimeException("Ho khau not found with id: " + id));
        
        // Get payment statistics
        double totalPaid = nopPhiService.calculateTotalPaymentsByHoKhau(id);
        List<NopPhi> payments = nopPhiService.findByHoKhau(id);
        long verifiedCount = payments.stream().filter(NopPhi::isDaXacNhan).count();
        double verifiedPercentage = payments.isEmpty() ? 0 : (verifiedCount * 100.0) / payments.size();
        
        Map<String, Object> statistics = Map.of(
            "totalPayments", payments.size(),
            "totalPaid", totalPaid,
            "verifiedCount", verifiedCount,
            "verifiedPercentage", verifiedPercentage
        );
        
        log.info("Statistics for ho khau {}: {}", id, statistics);
        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<NhanKhau>> getHoKhauMembers(@PathVariable Long id) {
        log.info("Getting members for ho khau with id: {}", id);
        List<NhanKhau> members = hoKhauService.getNhanKhauInHoKhau(id);
        log.info("Found {} members", members.size());
        return ResponseEntity.ok(members);
    }
    
    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HoKhau> addMemberToHoKhau(
            @PathVariable Long id,
            @RequestBody HoKhauNhanKhauRequest request) {
        log.info("Adding nhan khau with id {} to ho khau with id: {}", request.getNhanKhauId(), id);
        
        // Set the hoKhauId from the path variable
        request.setHoKhauId(id);
        
        HoKhau updatedHoKhau = hoKhauService.addNhanKhauToHoKhau(
                request.getHoKhauId(),
                request.getNhanKhauId(),
                request.getQuanHeVoiChuHo(),
                request.getGhiChu()
        );
        
        log.info("Nhan khau added successfully. Total members: {}", updatedHoKhau.getSoThanhVien());
        return ResponseEntity.ok(updatedHoKhau);
    }
    
    @DeleteMapping("/{hoKhauId}/members/{nhanKhauId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HoKhau> removeMemberFromHoKhau(
            @PathVariable Long hoKhauId,
            @PathVariable Long nhanKhauId,
            @RequestParam(required = false) String ghiChu) {
        log.info("Removing nhan khau with id {} from ho khau with id: {}", nhanKhauId, hoKhauId);
        
        HoKhau updatedHoKhau = hoKhauService.removeNhanKhauFromHoKhau(
                hoKhauId,
                nhanKhauId,
                ghiChu
        );
        
        log.info("Nhan khau removed successfully. Total members: {}", updatedHoKhau.getSoThanhVien());
        return ResponseEntity.ok(updatedHoKhau);
    }
}