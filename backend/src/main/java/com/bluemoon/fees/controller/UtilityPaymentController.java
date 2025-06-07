package com.bluemoon.fees.controller;

import com.bluemoon.fees.dto.UtilityPaymentDTO;
import com.bluemoon.fees.dto.UtilityPaymentRequest;
import com.bluemoon.fees.service.UtilityPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/utility-payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UtilityPaymentController {

    private final UtilityPaymentService utilityPaymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityPaymentDTO>> getAllUtilityPayments() {
        List<UtilityPaymentDTO> payments = utilityPaymentService.getAllUtilityPayments();
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<UtilityPaymentDTO> getUtilityPaymentById(@PathVariable Long id) {
        UtilityPaymentDTO payment = utilityPaymentService.getUtilityPaymentById(id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/household/{hoKhauId}")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityPaymentDTO>> getUtilityPaymentsByHousehold(@PathVariable Long hoKhauId) {
        List<UtilityPaymentDTO> payments = utilityPaymentService.getUtilityPaymentsByHoKhauId(hoKhauId);
        return ResponseEntity.ok(payments);
    }



    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityPaymentDTO>> getUtilityPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<UtilityPaymentDTO> payments = utilityPaymentService.getUtilityPaymentsByDateRange(startDate, endDate);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/household/{hoKhauId}/month/{thang}/year/{nam}")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityPaymentDTO>> getUtilityPaymentsByHouseholdAndMonth(
            @PathVariable Long hoKhauId,
            @PathVariable Integer thang,
            @PathVariable Integer nam) {
        List<UtilityPaymentDTO> payments = utilityPaymentService.getUtilityPaymentsByHouseholdAndMonth(hoKhauId, thang, nam);
        return ResponseEntity.ok(payments);
    }    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'KE_TOAN')")
    public ResponseEntity<UtilityPaymentDTO> createUtilityPayment(@Valid @RequestBody UtilityPaymentRequest request) {
        UtilityPaymentDTO createdPayment = utilityPaymentService.createUtilityPayment(request);
        return ResponseEntity.ok(createdPayment);
    }    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'KE_TOAN')")
    public ResponseEntity<UtilityPaymentDTO> updateUtilityPayment(
            @PathVariable Long id,
            @Valid @RequestBody UtilityPaymentRequest request) {
        UtilityPaymentDTO updatedPayment = utilityPaymentService.updateUtilityPayment(id, request);
        return ResponseEntity.ok(updatedPayment);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Void> deleteUtilityPayment(@PathVariable Long id) {
        utilityPaymentService.deleteUtilityPayment(id);
        return ResponseEntity.noContent().build();
    }    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'KE_TOAN')")
    public ResponseEntity<Void> cancelUtilityPayment(
            @PathVariable Long id,
            @RequestParam String reason) {
        utilityPaymentService.cancelUtilityPayment(id, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<List<UtilityPaymentDTO>> searchUtilityPayments(@RequestParam String search) {
        List<UtilityPaymentDTO> payments = utilityPaymentService.searchUtilityPayments(search);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/household/{hoKhauId}/total/{thang}/{nam}")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<Double> calculateTotalPaid(
            @PathVariable Long hoKhauId,
            @PathVariable Integer thang,
            @PathVariable Integer nam) {
        double total = utilityPaymentService.calculateTotalPaid(hoKhauId, thang, nam);
        return ResponseEntity.ok(total);
    }

    @GetMapping("/transaction-code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN','TO_TRUONG', 'KE_TOAN')")
    public ResponseEntity<UtilityPaymentDTO> getUtilityPaymentByTransactionCode(@PathVariable String code) {
        UtilityPaymentDTO payment = utilityPaymentService.findByTransactionCode(code);
        return ResponseEntity.ok(payment);
    }
}
