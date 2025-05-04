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

@RestController
@RequestMapping("/api/persons") 
@RequiredArgsConstructor
@Slf4j
public class NhanKhauController {

    private final NhanKhauService nhanKhauService;

    @GetMapping
    public ResponseEntity<List<NhanKhau>> getAllNhanKhau() {
        log.info("Getting all nhan khau records");
        List<NhanKhau> nhanKhauList = nhanKhauService.findAll();
        log.info("Found {} nhan khau records", nhanKhauList.size());
        return ResponseEntity.ok(nhanKhauList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhanKhau> getNhanKhauById(@PathVariable Long id) {
        log.info("Getting nhan khau with id: {}", id);
        return nhanKhauService.findById(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/cccd/{cccd}")
    public ResponseEntity<NhanKhau> getNhanKhauByCccd(@PathVariable String cccd) {
        log.info("Getting nhan khau with CCCD: {}", cccd);
        NhanKhau nhanKhau = nhanKhauService.findByCccd(cccd);
        log.info("Found nhan khau: {}", nhanKhau);
        return ResponseEntity.ok(nhanKhau);
    }

    @GetMapping("/search")
    public ResponseEntity<List<NhanKhau>> searchNhanKhau(
            @RequestParam(required = false) String hoTen,
            @RequestParam(required = false) String quanHeVoiChuHo) {
        log.info("Searching nhan khau with hoTen: {}, quanHeVoiChuHo: {}", hoTen, quanHeVoiChuHo);
        List<NhanKhau> nhanKhauList;
        
        if (hoTen != null && !hoTen.isEmpty()) {
            nhanKhauList = nhanKhauService.searchByHoTen(hoTen);
            log.info("Found {} nhan khau by hoTen", nhanKhauList.size());
        } else if (quanHeVoiChuHo != null && !quanHeVoiChuHo.isEmpty()) {
            nhanKhauList = nhanKhauService.findByQuanHeVoiChuHo(quanHeVoiChuHo);
            log.info("Found {} nhan khau by quanHeVoiChuHo", nhanKhauList.size());
        } else {
            nhanKhauList = nhanKhauService.findAll();
            log.info("No search parameters, returning all {} nhan khau", nhanKhauList.size());
        }
        
        return ResponseEntity.ok(nhanKhauList);
    }

    @GetMapping("/ngay-sinh-range")
    public ResponseEntity<List<NhanKhau>> getNhanKhauByNgaySinhRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting nhan khau with ngay sinh between {} and {}", startDate, endDate);
        List<NhanKhau> nhanKhauList = nhanKhauService.findByNgaySinhRange(startDate, endDate);
        log.info("Found {} nhan khau", nhanKhauList.size());
        return ResponseEntity.ok(nhanKhauList);
    }

    @PostMapping
    public ResponseEntity<NhanKhau> createNhanKhau(@RequestBody NhanKhau nhanKhau) {
        log.info("Creating new nhan khau: {}", nhanKhau);
        NhanKhau created = nhanKhauService.createNhanKhau(nhanKhau);
        log.info("Created nhan khau with id: {}", created.getId());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NhanKhau> updateNhanKhau(@PathVariable Long id, @RequestBody NhanKhau nhanKhau) {
        log.info("Updating nhan khau with id: {}", id);
        NhanKhau updated = nhanKhauService.updateNhanKhau(id, nhanKhau);
        log.info("Updated nhan khau: {}", updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteNhanKhau(@PathVariable Long id) {
        log.info("Deleting nhan khau with id: {}", id);
        nhanKhauService.deleteNhanKhau(id);
        log.info("Nhan khau deleted successfully");
        return ResponseEntity.ok().build();
    }
}