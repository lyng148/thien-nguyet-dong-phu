package com.bluemoon.fees.controller;

import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.service.NhanKhauService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api/persons") 
@RequiredArgsConstructor
@Slf4j
public class NhanKhauController {

    private final NhanKhauService nhanKhauService;

    @GetMapping
    public ResponseEntity<?> getAllNhanKhau() {
        log.info("Getting all nhan khau records");
        try {
            List<NhanKhau> nhanKhauList = nhanKhauService.findAll();
            log.info("Found {} nhan khau records", nhanKhauList.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Convert to simple map structure to avoid serialization issues
            for (NhanKhau nhanKhau : nhanKhauList) {
                Map<String, Object> item = convertNhanKhauToMap(nhanKhau);
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching all nhan khau records: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getNhanKhauById(@PathVariable Long id) {
        log.info("Getting nhan khau with id: {}", id);
        try {
            NhanKhau nhanKhau = nhanKhauService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Person not found with id: " + id));
            
            Map<String, Object> result = convertNhanKhauToMap(nhanKhau);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching nhan khau with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching record: " + e.getMessage());
        }
    }

    @GetMapping("/cccd/{cccd}")
    public ResponseEntity<?> getNhanKhauByCccd(@PathVariable String cccd) {
        log.info("Getting nhan khau with CCCD: {}", cccd);
        try {
            NhanKhau nhanKhau = nhanKhauService.findByCccd(cccd);
            if (nhanKhau == null) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> result = convertNhanKhauToMap(nhanKhau);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching nhan khau with CCCD {}: {}", cccd, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching record: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchNhanKhau(
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false) String quanHeVoiChuHo,
            @RequestParam(required = false) String q) {
        try {
            List<NhanKhau> nhanKhauList;
            
            if (q != null && !q.isEmpty()) {
                log.info("Searching nhan khau with general query: {}", q);
                // Default search by name if q is provided
                nhanKhauList = nhanKhauService.searchByHoTen(q);
                log.info("Found {} nhan khau by general query", nhanKhauList.size());
            } else if (hoTen != null && !hoTen.isEmpty()) {
                log.info("Searching nhan khau with hoTen: {}", hoTen);
                nhanKhauList = nhanKhauService.searchByHoTen(hoTen);
                log.info("Found {} nhan khau by hoTen", nhanKhauList.size());
            } else if (quanHeVoiChuHo != null && !quanHeVoiChuHo.isEmpty()) {
                log.info("Searching nhan khau with quanHeVoiChuHo: {}", quanHeVoiChuHo);
                nhanKhauList = nhanKhauService.findByQuanHeVoiChuHo(quanHeVoiChuHo);
                log.info("Found {} nhan khau by quanHeVoiChuHo", nhanKhauList.size());
            } else {
                log.info("No search parameters, returning all nhan khau");
                nhanKhauList = nhanKhauService.findAll();
                log.info("Returning all {} nhan khau", nhanKhauList.size());
            }
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Convert to simple map structure to avoid serialization issues
            for (NhanKhau nhanKhau : nhanKhauList) {
                Map<String, Object> item = convertNhanKhauToMap(nhanKhau);
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error searching nhan khau: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error searching records: " + e.getMessage());
        }
    }

    @GetMapping("/ngay-sinh-range")
    public ResponseEntity<?> getNhanKhauByNgaySinhRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting nhan khau with ngay sinh between {} and {}", startDate, endDate);
        try {
            List<NhanKhau> nhanKhauList = nhanKhauService.findByNgaySinhRange(startDate, endDate);
            log.info("Found {} nhan khau", nhanKhauList.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Convert to simple map structure to avoid serialization issues
            for (NhanKhau nhanKhau : nhanKhauList) {
                Map<String, Object> item = convertNhanKhauToMap(nhanKhau);
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching nhan khau by date range: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createNhanKhau(@RequestBody NhanKhau nhanKhau) {
        log.info("Creating new nhan khau: {}", nhanKhau);
        try {
            NhanKhau created = nhanKhauService.createNhanKhau(nhanKhau);
            log.info("Created nhan khau with id: {}", created.getId());
            
            Map<String, Object> result = convertNhanKhauToMap(created);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating nhan khau: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error creating record: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateNhanKhau(@PathVariable Long id, @RequestBody NhanKhau nhanKhau) {
        log.info("Updating nhan khau with id: {}", id);
        try {
            NhanKhau updated = nhanKhauService.updateNhanKhau(id, nhanKhau);
            log.info("Updated nhan khau: {}", updated);
            
            Map<String, Object> result = convertNhanKhauToMap(updated);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error updating nhan khau with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error updating record: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNhanKhau(@PathVariable Long id) {
        log.info("Deleting nhan khau with id: {}", id);
        try {
            nhanKhauService.deleteNhanKhau(id);
            log.info("Nhan khau deleted successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting nhan khau with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error deleting record: " + e.getMessage());
        }
    }
    
    // Helper method to convert NhanKhau entity to a Map for serialization
    private Map<String, Object> convertNhanKhauToMap(NhanKhau nhanKhau) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", nhanKhau.getId());
        map.put("hoTen", nhanKhau.getHoTen());
        
        map.put("ngaySinh", nhanKhau.getNgaySinh());
        map.put("gioiTinh", nhanKhau.getGioiTinh());
      
        map.put("danToc", nhanKhau.getDanToc());
        map.put("tonGiao", nhanKhau.getTonGiao());
     
        map.put("ngheNghiep", nhanKhau.getNgheNghiep());

        map.put("cccd", nhanKhau.getCccd());
        map.put("ngayCap", nhanKhau.getNgayCap());
        map.put("noiCap", nhanKhau.getNoiCap());
      
        map.put("ghiChu", nhanKhau.getGhiChu());
        
        // Add HoKhau relationship info if available
        if (nhanKhau.getHoKhau() != null) {
            try {
                map.put("hoKhauId", nhanKhau.getHoKhau().getId());
                map.put("soHoKhau", nhanKhau.getHoKhau().getSoHoKhau());
            } catch (Exception e) {
                log.warn("Error loading household data for person {}: {}", nhanKhau.getId(), e.getMessage());
                map.put("hoKhauId", null);
                map.put("soHoKhau", null);
            }
        } else {
            map.put("hoKhauId", null);
            map.put("soHoKhau", null);
        }
        
        map.put("quanHeVoiChuHo", nhanKhau.getQuanHeVoiChuHo());
        
        return map;
    }
}