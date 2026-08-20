package com.billbot.controller;

import com.billbot.dto.InvoiceRequest;
import com.billbot.dto.InvoiceResponse;
import com.billbot.dto.InvoiceStatusUpdateRequest;
import com.billbot.service.InvoiceService;
import com.billbot.service.PdfInvoiceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final PdfInvoiceService pdfInvoiceService;

    public InvoiceController(InvoiceService invoiceService, PdfInvoiceService pdfInvoiceService) {
        this.invoiceService = invoiceService;
        this.pdfInvoiceService = pdfInvoiceService;
    }

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody InvoiceRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        InvoiceResponse response = invoiceService.createInvoice(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getInvoices(
            @RequestParam(required = false) String search,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(invoiceService.searchInvoices(search, userId));
        }
        return ResponseEntity.ok(invoiceService.getUserInvoices(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoice(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(invoiceService.getInvoice(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceResponse> updateInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody InvoiceRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request, userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<InvoiceResponse> updateInvoiceStatus(
            @PathVariable UUID id,
            @Valid @RequestBody InvoiceStatusUpdateRequest request,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, request.status(), userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        invoiceService.deleteInvoice(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getInvoicePdf(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String userId = authentication.getName();
        byte[] pdfData = pdfInvoiceService.generateInvoicePdf(id, userId);
        InvoiceResponse invoice = invoiceService.getInvoice(id, userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"invoice-" + invoice.invoiceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfData);
    }
}
