package com.bluemoon.fees.controller;

import com.bluemoon.fees.entity.LichSuHoKhau;
import com.bluemoon.fees.service.LichSuHoKhauService;
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
@RequestMapping("/api/household-history") 
@RequiredArgsConstructor
@Slf4j
public class LichSuHoKhauController {

    private final LichSuHoKhauService lichSuHoKhauService;

    @GetMapping
    public ResponseEntity<?> getAllLichSuHoKhau() {
        log.info("Getting all lich su ho khau records");
        try {
            List<LichSuHoKhau> records = lichSuHoKhauService.findAll();
            log.info("Found {} lich su ho khau records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (LichSuHoKhau record : records) {
                result.add(convertToMap(record));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching all household history records: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getLichSuHoKhauById(@PathVariable Long id) {
        log.info("Getting lich su ho khau with id: {}", id);
        try {
            LichSuHoKhau record = lichSuHoKhauService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Household history not found with id: " + id));
            
            Map<String, Object> result = convertToMap(record);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching household history with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching record: " + e.getMessage());
        }
    }

    @GetMapping("/ho-khau/{hoKhauId}")
    public ResponseEntity<?> getLichSuHoKhauByHoKhau(@PathVariable Long hoKhauId) {
        log.info("Getting lich su ho khau for ho khau with id: {}", hoKhauId);
        try {
            List<LichSuHoKhau> records = lichSuHoKhauService.findByHoKhauId(hoKhauId);
            log.info("Found {} records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (LichSuHoKhau record : records) {
                result.add(convertToMap(record));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching household history for household id {}: {}", hoKhauId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/nhan-khau/{nhanKhauId}")
    public ResponseEntity<?> getLichSuHoKhauByNhanKhau(@PathVariable Long nhanKhauId) {
        log.info("Getting lich su ho khau for nhan khau with id: {}", nhanKhauId);
        try {
            List<LichSuHoKhau> records = lichSuHoKhauService.findByNhanKhauId(nhanKhauId);
            log.info("Found {} records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (LichSuHoKhau record : records) {
                result.add(convertToMap(record));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching household history for person id {}: {}", nhanKhauId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/loai-thay-doi/{loaiThayDoi}")
    public ResponseEntity<?> getLichSuHoKhauByLoaiThayDoi(
            @PathVariable LichSuHoKhau.LoaiThayDoi loaiThayDoi) {
        log.info("Getting lich su ho khau with loai thay doi: {}", loaiThayDoi);
        try {
            List<LichSuHoKhau> records = lichSuHoKhauService.findByLoaiThayDoi(loaiThayDoi);
            log.info("Found {} records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (LichSuHoKhau record : records) {
                result.add(convertToMap(record));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching household history by change type {}: {}", loaiThayDoi, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/thoi-gian-range")
    public ResponseEntity<?> getLichSuHoKhauByThoiGianRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting lich su ho khau with thoi gian between {} and {}", startDate, endDate);
        try {
            List<LichSuHoKhau> records = lichSuHoKhauService.findByThoiGianRange(startDate, endDate);
            log.info("Found {} records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (LichSuHoKhau record : records) {
                result.add(convertToMap(record));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching household history by date range from {} to {}: {}", startDate, endDate, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createLichSuHoKhau(@RequestBody Map<String, Object> requestBody) {
        log.info("Creating new lich su ho khau: {}", requestBody);
        try {
            LichSuHoKhau lichSuHoKhau = new LichSuHoKhau();
            
            // Set loai thay doi
            if (requestBody.containsKey("loaiThayDoi")) {
                lichSuHoKhau.setLoaiThayDoi(LichSuHoKhau.LoaiThayDoi.valueOf(requestBody.get("loaiThayDoi").toString()));
            }
            
            // Set thoi gian
            if (requestBody.containsKey("thoiGian")) {
                String thoiGianStr = (String) requestBody.get("thoiGian");
                lichSuHoKhau.setThoiGian(LocalDate.parse(thoiGianStr));
            } else {
                lichSuHoKhau.setThoiGian(LocalDate.now());
            }
            
            // Set ghi chu
            if (requestBody.containsKey("ghiChu")) {
                lichSuHoKhau.setGhiChu((String) requestBody.get("ghiChu"));
            }
            
            // Process relationships safely
            try {
                // Handle hoKhauId reference
                if (requestBody.containsKey("hoKhauId")) {
                    Long hoKhauId = Long.valueOf(requestBody.get("hoKhauId").toString());
                    lichSuHoKhau.setHoKhau(lichSuHoKhauService.getHoKhauReference(hoKhauId));
                }
                
                // Handle nhanKhauId reference
                if (requestBody.containsKey("nhanKhauId")) {
                    Long nhanKhauId = Long.valueOf(requestBody.get("nhanKhauId").toString());
                    lichSuHoKhau.setNhanKhau(lichSuHoKhauService.getNhanKhauReference(nhanKhauId));
                }
            } catch (Exception e) {
                log.error("Error setting references: {}", e.getMessage(), e);
                return ResponseEntity.badRequest().body("Error setting references: " + e.getMessage());
            }
            
            LichSuHoKhau created = lichSuHoKhauService.createLichSuHoKhau(lichSuHoKhau);
            log.info("Created lich su ho khau with id: {}", created.getId());
            
            Map<String, Object> result = convertToMap(created);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating household history: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error creating record: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateLichSuHoKhau(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> requestBody) {
        log.info("Updating lich su ho khau with id: {}", id);
        try {
            // Check if record exists
            LichSuHoKhau existing = lichSuHoKhauService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found with id: " + id));
            
            LichSuHoKhau lichSuHoKhau = new LichSuHoKhau();
            lichSuHoKhau.setId(id);
            
            // Set loai thay doi
            if (requestBody.containsKey("loaiThayDoi")) {
                lichSuHoKhau.setLoaiThayDoi(LichSuHoKhau.LoaiThayDoi.valueOf(requestBody.get("loaiThayDoi").toString()));
            } else {
                lichSuHoKhau.setLoaiThayDoi(existing.getLoaiThayDoi());
            }
            
            // Set thoi gian
            if (requestBody.containsKey("thoiGian")) {
                String thoiGianStr = (String) requestBody.get("thoiGian");
                lichSuHoKhau.setThoiGian(LocalDate.parse(thoiGianStr));
            } else {
                lichSuHoKhau.setThoiGian(existing.getThoiGian());
            }
            
            // Set ghi chu
            if (requestBody.containsKey("ghiChu")) {
                lichSuHoKhau.setGhiChu((String) requestBody.get("ghiChu"));
            } else {
                lichSuHoKhau.setGhiChu(existing.getGhiChu());
            }
            
            // Process relationships safely
            try {
                // Handle hoKhauId reference
                if (requestBody.containsKey("hoKhauId")) {
                    Long hoKhauId = Long.valueOf(requestBody.get("hoKhauId").toString());
                    lichSuHoKhau.setHoKhau(lichSuHoKhauService.getHoKhauReference(hoKhauId));
                } else {
                    lichSuHoKhau.setHoKhau(existing.getHoKhau());
                }
                
                // Handle nhanKhauId reference
                if (requestBody.containsKey("nhanKhauId")) {
                    Long nhanKhauId = Long.valueOf(requestBody.get("nhanKhauId").toString());
                    lichSuHoKhau.setNhanKhau(lichSuHoKhauService.getNhanKhauReference(nhanKhauId));
                } else {
                    lichSuHoKhau.setNhanKhau(existing.getNhanKhau());
                }
            } catch (Exception e) {
                log.error("Error setting references: {}", e.getMessage(), e);
                return ResponseEntity.badRequest().body("Error setting references: " + e.getMessage());
            }
            
            LichSuHoKhau updated = lichSuHoKhauService.updateLichSuHoKhau(id, lichSuHoKhau);
            log.info("Updated lich su ho khau: {}", updated);
            
            Map<String, Object> result = convertToMap(updated);
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating household history with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error updating record: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLichSuHoKhau(@PathVariable Long id) {
        log.info("Deleting lich su ho khau with id: {}", id);
        try {
            lichSuHoKhauService.deleteLichSuHoKhau(id);
            log.info("Lich su ho khau deleted successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting household history with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error deleting record: " + e.getMessage());
        }
    }
    
    // Helper method to convert LichSuHoKhau entity to Map for serialization
    private Map<String, Object> convertToMap(LichSuHoKhau record) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", record.getId());
        map.put("thoiGian", record.getThoiGian());
        map.put("ghiChu", record.getGhiChu());
        
        if (record.getLoaiThayDoi() != null) {
            map.put("loaiThayDoi", record.getLoaiThayDoi().toString());
        } else {
            map.put("loaiThayDoi", null);
        }
        
        // Safely handle HoKhau relationship
        if (record.getHoKhau() != null) {
            try {
                map.put("hoKhauId", record.getHoKhau().getId());
                map.put("soHoKhau", record.getHoKhau().getSoHoKhau());
            } catch (Exception e) {
                log.warn("Error loading ho khau data for household history {}: {}", record.getId(), e.getMessage());
                map.put("hoKhauId", null);
                map.put("soHoKhau", null);
            }
        } else {
            map.put("hoKhauId", null);
            map.put("soHoKhau", null);
        }
        
        // Safely handle NhanKhau relationship
        if (record.getNhanKhau() != null) {
            try {
                map.put("nhanKhauId", record.getNhanKhau().getId());
                map.put("hoTenNhanKhau", record.getNhanKhau().getHoTen());
            } catch (Exception e) {
                log.warn("Error loading nhan khau data for household history {}: {}", record.getId(), e.getMessage());
                map.put("nhanKhauId", null);
                map.put("hoTenNhanKhau", null);
            }
        } else {
            map.put("nhanKhauId", null);
            map.put("hoTenNhanKhau", null);
        }
        
        return map;
    }
}