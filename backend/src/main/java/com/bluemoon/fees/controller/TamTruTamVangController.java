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

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/temporary-residence") // Using English endpoint for consistency with frontend
@RequiredArgsConstructor
@Slf4j
public class TamTruTamVangController {

    private final TamTruTamVangService tamTruTamVangService;
    private final NhanKhauService nhanKhauService;

    @GetMapping
    public ResponseEntity<List<TamTruTamVang>> getAllTamTruTamVang() {
        log.info("Getting all tam tru tam vang records");
        List<TamTruTamVang> records = tamTruTamVangService.findAll();
        log.info("Found {} tam tru tam vang records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TamTruTamVang> getTamTruTamVangById(@PathVariable Long id) {
        log.info("Getting tam tru tam vang with id: {}", id);
        return tamTruTamVangService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<TamTruTamVang>> getTamTruTamVangByTrangThai(
            @PathVariable TamTruTamVang.TrangThai trangThai) {
        log.info("Getting tam tru tam vang with trang thai: {}", trangThai);
        List<TamTruTamVang> records = tamTruTamVangService.findByTrangThai(trangThai);
        log.info("Found {} records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/nhan-khau/{nhanKhauId}")
    public ResponseEntity<List<TamTruTamVang>> getTamTruTamVangByNhanKhau(@PathVariable Long nhanKhauId) {
        log.info("Getting tam tru tam vang for nhan khau with id: {}", nhanKhauId);
        List<TamTruTamVang> records = tamTruTamVangService.findByNhanKhauId(nhanKhauId);
        log.info("Found {} records", records.size());
        return ResponseEntity.ok(records);
    }

    @GetMapping("/thoi-gian-range")
    public ResponseEntity<List<TamTruTamVang>> getTamTruTamVangByThoiGianRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting tam tru tam vang with thoi gian between {} and {}", startDate, endDate);
        List<TamTruTamVang> records = tamTruTamVangService.findByThoiGianRange(startDate, endDate);
        log.info("Found {} records", records.size());
        return ResponseEntity.ok(records);
    }

    @PostMapping
    public ResponseEntity<TamTruTamVang> createTamTruTamVang(@RequestBody TamTruTamVang tamTruTamVang) {
        log.info("Creating new tam tru tam vang: {}", tamTruTamVang);
        TamTruTamVang created = tamTruTamVangService.createTamTruTamVang(tamTruTamVang);
        log.info("Created tam tru tam vang with id: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TamTruTamVang> updateTamTruTamVang(
            @PathVariable Long id, 
            @RequestBody TamTruTamVang tamTruTamVang) {
        log.info("Updating tam tru tam vang with id: {}", id);
        TamTruTamVang updated = tamTruTamVangService.updateTamTruTamVang(id, tamTruTamVang);
        log.info("Updated tam tru tam vang: {}", updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTamTruTamVang(@PathVariable Long id) {
        log.info("Deleting tam tru tam vang with id: {}", id);
        tamTruTamVangService.deleteTamTruTamVang(id);
        log.info("Tam tru tam vang deleted successfully");
        return ResponseEntity.ok().build();
    }
}