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

@RestController
@RequestMapping("/api/household-history") 
@RequiredArgsConstructor
@Slf4j
public class LichSuHoKhauController {

    private final LichSuHoKhauService lichSuHoKhauService;

    @GetMapping
    public ResponseEntity<List<LichSuHoKhau>> getAllLichSuHoKhau() {
        log.info("Getting all lich su ho khau records");
        List<LichSuHoKhau> records = lichSuHoKhauService.findAll();
        log.info("Found {} lich su ho khau records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LichSuHoKhau> getLichSuHoKhauById(@PathVariable Long id) {
        log.info("Getting lich su ho khau with id: {}", id);
        return lichSuHoKhauService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/ho-khau/{hoKhauId}")
    public ResponseEntity<List<LichSuHoKhau>> getLichSuHoKhauByHoKhau(@PathVariable Long hoKhauId) {
        log.info("Getting lich su ho khau for ho khau with id: {}", hoKhauId);
        List<LichSuHoKhau> records = lichSuHoKhauService.findByHoKhauId(hoKhauId);
        log.info("Found {} records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/nhan-khau/{nhanKhauId}")
    public ResponseEntity<List<LichSuHoKhau>> getLichSuHoKhauByNhanKhau(@PathVariable Long nhanKhauId) {
        log.info("Getting lich su ho khau for nhan khau with id: {}", nhanKhauId);
        List<LichSuHoKhau> records = lichSuHoKhauService.findByNhanKhauId(nhanKhauId);
        log.info("Found {} records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/loai-thay-doi/{loaiThayDoi}")
    public ResponseEntity<List<LichSuHoKhau>> getLichSuHoKhauByLoaiThayDoi(
            @PathVariable LichSuHoKhau.LoaiThayDoi loaiThayDoi) {
        log.info("Getting lich su ho khau with loai thay doi: {}", loaiThayDoi);
        List<LichSuHoKhau> records = lichSuHoKhauService.findByLoaiThayDoi(loaiThayDoi);
        log.info("Found {} records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/thoi-gian-range")
    public ResponseEntity<List<LichSuHoKhau>> getLichSuHoKhauByThoiGianRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting lich su ho khau with thoi gian between {} and {}", startDate, endDate);
        List<LichSuHoKhau> records = lichSuHoKhauService.findByThoiGianRange(startDate, endDate);
        log.info("Found {} records", records.size());
        return ResponseEntity.ok(records);
    }

    @PostMapping
    public ResponseEntity<LichSuHoKhau> createLichSuHoKhau(@RequestBody LichSuHoKhau lichSuHoKhau) {
        log.info("Creating new lich su ho khau: {}", lichSuHoKhau);
        LichSuHoKhau created = lichSuHoKhauService.createLichSuHoKhau(lichSuHoKhau);
        log.info("Created lich su ho khau with id: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LichSuHoKhau> updateLichSuHoKhau(
            @PathVariable Long id, 
            @RequestBody LichSuHoKhau lichSuHoKhau) {
        log.info("Updating lich su ho khau with id: {}", id);
        LichSuHoKhau updated = lichSuHoKhauService.updateLichSuHoKhau(id, lichSuHoKhau);
        log.info("Updated lich su ho khau: {}", updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteLichSuHoKhau(@PathVariable Long id) {
        log.info("Deleting lich su ho khau with id: {}", id);
        lichSuHoKhauService.deleteLichSuHoKhau(id);
        log.info("Lich su ho khau deleted successfully");
        return ResponseEntity.ok().build();
    }
}