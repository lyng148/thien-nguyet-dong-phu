package com.bluemoon.fees.controller;

import com.bluemoon.fees.entity.TamTruTamVang;
import com.bluemoon.fees.entity.NhanKhau;
import com.bluemoon.fees.service.TamTruTamVangService;
import com.bluemoon.fees.service.NhanKhauService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/temporary-residence") // Using English endpoint for consistency with frontend
@RequiredArgsConstructor
@Slf4j
public class TamTruTamVangController {

    private final TamTruTamVangService tamTruTamVangService;
    private final NhanKhauService nhanKhauService;

    // Modified to support pagination and avoid serialization issues
    @GetMapping
    public ResponseEntity<?> getAllTamTruTamVang(
            @PageableDefault(size = 50) Pageable pageable) {
        log.info("Getting all tam tru tam vang records with pagination: {}", pageable);
        try {
            List<TamTruTamVang> records = tamTruTamVangService.findAll(pageable).getContent();
            log.info("Found {} tam tru tam vang records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Convert to simple map structure to avoid serialization issues
            for (TamTruTamVang record : records) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", record.getId());
                item.put("trangThai", record.getTrangThai() != null ? record.getTrangThai().toString() : null);
                item.put("diaChiTamTruTamVang", record.getDiaChiTamTruTamVang());
                item.put("thoiGian", record.getThoiGian());
                item.put("noiDungDeNghi", record.getNoiDungDeNghi());
                
                // Add person information safely
                if (record.getNhanKhau() != null) {
                    try {
                        item.put("nhanKhauId", record.getNhanKhau().getId());
                        item.put("hoTen", record.getNhanKhau().getHoTen());
                    } catch (Exception e) {
                        log.warn("Error loading related entity data for record {}: {}", record.getId(), e.getMessage());
                        item.put("nhanKhauId", null);
                        item.put("hoTen", "Unknown");
                    }
                } else {
                    item.put("nhanKhauId", null);
                    item.put("hoTen", null);
                }
                
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching temporary residence records: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTamTruTamVangById(@PathVariable Long id) {
        log.info("Getting tam tru tam vang with id: {}", id);
        try {
            TamTruTamVang record = tamTruTamVangService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found with id: " + id));
            
            Map<String, Object> result = new HashMap<>();
            result.put("id", record.getId());
            result.put("trangThai", record.getTrangThai() != null ? record.getTrangThai().toString() : null);
            result.put("diaChiTamTruTamVang", record.getDiaChiTamTruTamVang());
            result.put("thoiGian", record.getThoiGian());
            result.put("noiDungDeNghi", record.getNoiDungDeNghi());
            
            // Add person information safely
            if (record.getNhanKhau() != null) {
                try {
                    result.put("nhanKhauId", record.getNhanKhau().getId());
                    result.put("hoTen", record.getNhanKhau().getHoTen());
                } catch (Exception e) {
                    log.warn("Error loading related entity data for record {}: {}", record.getId(), e.getMessage());
                    result.put("nhanKhauId", null);
                    result.put("hoTen", "Unknown");
                }
            }
            
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching record with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching record: " + e.getMessage());
        }
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<?> getTamTruTamVangByTrangThai(
            @PathVariable TamTruTamVang.TrangThai trangThai) {
        log.info("Getting tam tru tam vang with trang thai: {}", trangThai);
        try {
            List<TamTruTamVang> records = tamTruTamVangService.findByTrangThai(trangThai);
            log.info("Found {} records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Convert to simple map structure to avoid serialization issues
            for (TamTruTamVang record : records) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", record.getId());
                item.put("trangThai", record.getTrangThai() != null ? record.getTrangThai().toString() : null);
                item.put("diaChiTamTruTamVang", record.getDiaChiTamTruTamVang());
                item.put("thoiGian", record.getThoiGian());
                item.put("noiDungDeNghi", record.getNoiDungDeNghi());
                
                // Add person information safely
                if (record.getNhanKhau() != null) {
                    try {
                        item.put("nhanKhauId", record.getNhanKhau().getId());
                        item.put("hoTen", record.getNhanKhau().getHoTen());
                    } catch (Exception e) {
                        item.put("nhanKhauId", null);
                        item.put("hoTen", "Unknown");
                    }
                } else {
                    item.put("nhanKhauId", null);
                    item.put("hoTen", null);
                }
                
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching records by trang thai {}: {}", trangThai, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/nhan-khau/{nhanKhauId}")
    public ResponseEntity<?> getTamTruTamVangByNhanKhau(@PathVariable Long nhanKhauId) {
        log.info("Getting tam tru tam vang for nhan khau with id: {}", nhanKhauId);
        try {
            List<TamTruTamVang> records = tamTruTamVangService.findByNhanKhauId(nhanKhauId);
            log.info("Found {} records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Convert to simple map structure to avoid serialization issues
            for (TamTruTamVang record : records) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", record.getId());
                item.put("trangThai", record.getTrangThai() != null ? record.getTrangThai().toString() : null);
                item.put("diaChiTamTruTamVang", record.getDiaChiTamTruTamVang());
                item.put("thoiGian", record.getThoiGian());
                item.put("noiDungDeNghi", record.getNoiDungDeNghi());
                
                // Add person information safely
                if (record.getNhanKhau() != null) {
                    try {
                        item.put("nhanKhauId", record.getNhanKhau().getId());
                        item.put("hoTen", record.getNhanKhau().getHoTen());
                    } catch (Exception e) {
                        item.put("nhanKhauId", nhanKhauId);
                        item.put("hoTen", "Unknown");
                    }
                } else {
                    item.put("nhanKhauId", nhanKhauId);
                    item.put("hoTen", null);
                }
                
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching records by nhan khau id {}: {}", nhanKhauId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @GetMapping("/person/{personId}")
    public ResponseEntity<?> getTamTruTamVangByPersonId(@PathVariable Long personId) {
        log.info("Getting tam tru tam vang for person with id: {}", personId);
        return getTamTruTamVangByNhanKhau(personId); // Reuse existing implementation
    }

    @GetMapping("/thoi-gian-range")
    public ResponseEntity<?> getTamTruTamVangByThoiGianRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting tam tru tam vang with thoi gian between {} and {}", startDate, endDate);
        try {
            List<TamTruTamVang> records = tamTruTamVangService.findByThoiGianRange(startDate, endDate);
            log.info("Found {} records", records.size());
            
            List<Map<String, Object>> result = new ArrayList<>();
            
            // Convert to simple map structure to avoid serialization issues
            for (TamTruTamVang record : records) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", record.getId());
                item.put("trangThai", record.getTrangThai() != null ? record.getTrangThai().toString() : null);
                item.put("diaChiTamTruTamVang", record.getDiaChiTamTruTamVang());
                item.put("thoiGian", record.getThoiGian());
                item.put("noiDungDeNghi", record.getNoiDungDeNghi());
                
                // Add person information safely
                if (record.getNhanKhau() != null) {
                    try {
                        item.put("nhanKhauId", record.getNhanKhau().getId());
                        item.put("hoTen", record.getNhanKhau().getHoTen());
                    } catch (Exception e) {
                        item.put("nhanKhauId", null);
                        item.put("hoTen", "Unknown");
                    }
                } else {
                    item.put("nhanKhauId", null);
                    item.put("hoTen", null);
                }
                
                result.add(item);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error fetching records by date range from {} to {}: {}", startDate, endDate, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error fetching records: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTamTruTamVang(@RequestBody Map<String, Object> requestBody) {
        log.info("Creating new tam tru tam vang: {}", requestBody);
        try {
            TamTruTamVang tamTruTamVang = new TamTruTamVang();
            
            // Set properties from request body
            if (requestBody.containsKey("trangThai")) {
                tamTruTamVang.setTrangThai(TamTruTamVang.TrangThai.valueOf(requestBody.get("trangThai").toString()));
            }
            
            if (requestBody.containsKey("diaChiTamTruTamVang")) {
                tamTruTamVang.setDiaChiTamTruTamVang((String) requestBody.get("diaChiTamTruTamVang"));
            }
            
            if (requestBody.containsKey("thoiGian")) {
                String thoiGianStr = (String) requestBody.get("thoiGian");
                tamTruTamVang.setThoiGian(LocalDate.parse(thoiGianStr));
            }
            
            if (requestBody.containsKey("noiDungDeNghi")) {
                tamTruTamVang.setNoiDungDeNghi((String) requestBody.get("noiDungDeNghi"));
            }
            
            // Handle nhanKhau relationship
            if (requestBody.containsKey("nhanKhau") && requestBody.get("nhanKhau") != null) {
                Map<String, Object> nhanKhauMap = (Map<String, Object>) requestBody.get("nhanKhau");
                if (nhanKhauMap.containsKey("id")) {
                    Long nhanKhauId = Long.valueOf(nhanKhauMap.get("id").toString());
                    NhanKhau nhanKhau = nhanKhauService.findById(nhanKhauId)
                            .orElseThrow(() -> new EntityNotFoundException("NhanKhau not found with id: " + nhanKhauId));
                    tamTruTamVang.setNhanKhau(nhanKhau);
                }
            }
            
            TamTruTamVang created = tamTruTamVangService.createTamTruTamVang(tamTruTamVang);
            log.info("Created tam tru tam vang with id: {}", created.getId());
            
            // Return simplified response
            Map<String, Object> result = new HashMap<>();
            result.put("id", created.getId());
            result.put("trangThai", created.getTrangThai() != null ? created.getTrangThai().toString() : null);
            result.put("diaChiTamTruTamVang", created.getDiaChiTamTruTamVang());
            result.put("thoiGian", created.getThoiGian());
            result.put("noiDungDeNghi", created.getNoiDungDeNghi());
            
            if (created.getNhanKhau() != null) {
                result.put("nhanKhauId", created.getNhanKhau().getId());
                result.put("hoTen", created.getNhanKhau().getHoTen());
            } else {
                result.put("nhanKhauId", null);
                result.put("hoTen", null);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating record: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error creating record: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTamTruTamVang(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> requestBody) {
        log.info("Updating tam tru tam vang with id: {}", id);
        try {
            TamTruTamVang existing = tamTruTamVangService.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Record not found with id: " + id));
            
            TamTruTamVang tamTruTamVang = new TamTruTamVang();
            tamTruTamVang.setId(id);
            
            // Set properties from request body
            if (requestBody.containsKey("trangThai")) {
                tamTruTamVang.setTrangThai(TamTruTamVang.TrangThai.valueOf(requestBody.get("trangThai").toString()));
            }
            
            if (requestBody.containsKey("diaChiTamTruTamVang")) {
                tamTruTamVang.setDiaChiTamTruTamVang((String) requestBody.get("diaChiTamTruTamVang"));
            }
            
            if (requestBody.containsKey("thoiGian")) {
                String thoiGianStr = (String) requestBody.get("thoiGian");
                tamTruTamVang.setThoiGian(LocalDate.parse(thoiGianStr));
            }
            
            if (requestBody.containsKey("noiDungDeNghi")) {
                tamTruTamVang.setNoiDungDeNghi((String) requestBody.get("noiDungDeNghi"));
            }
            
            // Handle nhanKhau relationship
            if (requestBody.containsKey("nhanKhau") && requestBody.get("nhanKhau") != null) {
                Map<String, Object> nhanKhauMap = (Map<String, Object>) requestBody.get("nhanKhau");
                if (nhanKhauMap.containsKey("id")) {
                    Long nhanKhauId = Long.valueOf(nhanKhauMap.get("id").toString());
                    NhanKhau nhanKhau = nhanKhauService.findById(nhanKhauId)
                            .orElseThrow(() -> new EntityNotFoundException("NhanKhau not found with id: " + nhanKhauId));
                    tamTruTamVang.setNhanKhau(nhanKhau);
                }
            }
            
            TamTruTamVang updated = tamTruTamVangService.updateTamTruTamVang(id, tamTruTamVang);
            log.info("Updated tam tru tam vang: {}", updated);
            
            // Return simplified response
            Map<String, Object> result = new HashMap<>();
            result.put("id", updated.getId());
            result.put("trangThai", updated.getTrangThai() != null ? updated.getTrangThai().toString() : null);
            result.put("diaChiTamTruTamVang", updated.getDiaChiTamTruTamVang());
            result.put("thoiGian", updated.getThoiGian());
            result.put("noiDungDeNghi", updated.getNoiDungDeNghi());
            
            if (updated.getNhanKhau() != null) {
                result.put("nhanKhauId", updated.getNhanKhau().getId());
                result.put("hoTen", updated.getNhanKhau().getHoTen());
            } else {
                result.put("nhanKhauId", null);
                result.put("hoTen", null);
            }
            
            return ResponseEntity.ok(result);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating record with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error updating record: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTamTruTamVang(@PathVariable Long id) {
        log.info("Deleting tam tru tam vang with id: {}", id);
        try {
            tamTruTamVangService.deleteTamTruTamVang(id);
            log.info("Tam tru tam vang deleted successfully");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting record with id {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error deleting record: " + e.getMessage());
        }
    }
}