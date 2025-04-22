package com.dgi.app.controller;

import com.dgi.app.model.Attestation;
import com.dgi.app.model.User;
import com.dgi.app.payload.request.AttestationCreateRequest;
import com.dgi.app.payload.response.AttestationResponse;
import com.dgi.app.payload.response.MessageResponse;
import com.dgi.app.repository.AttestationRepository;
import com.dgi.app.repository.UserRepository;
import com.dgi.app.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/attestations")
public class AttestationController {
    @Autowired
    AttestationRepository attestationRepository;

    @Autowired
    UserRepository userRepository;

    // Helper to get current authenticated user
    private User getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null) {
                throw new RuntimeException("No authentication found in SecurityContext");
            }

            if (authentication.getPrincipal() == null) {
                throw new RuntimeException("No principal found in Authentication");
            }

            if (!(authentication.getPrincipal() instanceof UserDetailsImpl)) {
                throw new RuntimeException("Principal is not of expected type: " +
                        authentication.getPrincipal().getClass().getName());
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            return userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found with id: " + userDetails.getId()));
        } catch (Exception e) {
            // Log the error
            System.err.println("Error getting current user: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // Convert Attestation entity to AttestationResponse DTO
    private AttestationResponse convertToDTO(Attestation attestation) {
        AttestationResponse dto = new AttestationResponse();
        dto.setId(attestation.getId());
        dto.setIfValue(attestation.getIfValue());
        dto.setCin(attestation.getCin());
        dto.setNom(attestation.getNom());
        dto.setPrenom(attestation.getPrenom());
        dto.setEmail(attestation.getEmail());
        dto.setPhone(attestation.getPhone());
        dto.setType(attestation.getType());
        dto.setStatus(attestation.getStatus());
        dto.setCreatedAt(attestation.getCreatedAt());
        dto.setUpdatedAt(attestation.getUpdatedAt());

        if (attestation.getCreator() != null) {
            dto.setCreatorId(attestation.getCreator().getId());
            dto.setCreatorUsername(attestation.getCreator().getUsername());
        }

        return dto;
    }

    // Create a new attestation - FRONTDESK or MANAGER can create
    @PostMapping("/create")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> createAttestation(@Valid @RequestBody AttestationCreateRequest createRequest) {
        try {
            // Get current authenticated user
            User currentUser = getCurrentUser();

            // Create new attestation entity
            Attestation attestation = new Attestation();
            attestation.setIfValue(createRequest.getIfValue());
            attestation.setCin(createRequest.getCin());
            attestation.setNom(createRequest.getNom());
            attestation.setPrenom(createRequest.getPrenom());
            attestation.setEmail(createRequest.getEmail());
            attestation.setPhone(createRequest.getPhone());
            attestation.setType(createRequest.getType());
            attestation.setStatus("déposé");
            attestation.setCreator(currentUser);
            attestation.setCreatedAt(LocalDateTime.now());
            attestation.setUpdatedAt(LocalDateTime.now());

            // Save to database
            Attestation savedAttestation = attestationRepository.save(attestation);

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedAttestation));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Erreur lors de la création de l'attestation: " + e.getMessage()));
        }
    }

    // Get all attestations - MANAGER can see all
    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> getAllAttestations() {
        List<Attestation> attestations = attestationRepository.findAll();
        List<AttestationResponse> dtos = attestations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get all attestations for tracking - available to all roles that need it
    @GetMapping("/track")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> getAllAttestationsForTracking() {
        List<Attestation> attestations = attestationRepository.findAll();
        List<AttestationResponse> dtos = attestations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get attestations created by current FRONTDESK agent
    @GetMapping("/my-attestations")
    @PreAuthorize("hasRole('FRONTDESK')")
    public ResponseEntity<?> getMyAttestations() {
        User currentUser = getCurrentUser();
        List<Attestation> attestations = attestationRepository.findByCreator(currentUser);
        List<AttestationResponse> dtos = attestations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get attestations by type
    @GetMapping("/type/{type}")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> getAttestationsByType(@PathVariable String type) {
        List<Attestation> attestations = attestationRepository.findByType(type);
        List<AttestationResponse> dtos = attestations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Search attestations by name
    @GetMapping("/search/nom")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> searchAttestationsByName(@RequestParam String query) {
        List<Attestation> attestations = attestationRepository.findByNomContainingIgnoreCase(query);
        List<AttestationResponse> dtos = attestations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Search attestations by CIN
    @GetMapping("/search/cin")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> searchAttestationsByCin(@RequestParam String query) {
        List<Attestation> attestations = attestationRepository.findByCinContainingIgnoreCase(query);
        List<AttestationResponse> dtos = attestations.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Get a single attestation by ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> getAttestationById(@PathVariable Long id) {
        Optional<Attestation> attestation = attestationRepository.findById(id);
        if (attestation.isPresent()) {
            return ResponseEntity.ok(convertToDTO(attestation.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Update attestation status to "livré"
    @PutMapping("/{id}/deliver")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<?> markAttestationAsDelivered(@PathVariable Long id) {
        try {
            Optional<Attestation> attestationOpt = attestationRepository.findById(id);

            if (!attestationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Attestation attestation = attestationOpt.get();
            attestation.setStatus("livré");
            attestation.setUpdatedAt(LocalDateTime.now());

            Attestation updatedAttestation = attestationRepository.save(attestation);

            return ResponseEntity.ok(convertToDTO(updatedAttestation));
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Erreur lors de la mise à jour de l'attestation: " + e.getMessage()));
        }
    }

    // Generate receipt PDF for an attestation
    @GetMapping("/{id}/receipt")
    @PreAuthorize("hasRole('FRONTDESK') or hasRole('MANAGER')")
    public ResponseEntity<byte[]> generateAttestationReceipt(@PathVariable Long id) {
        try {
            // Find the attestation
            Optional<Attestation> attestationOpt = attestationRepository.findById(id);
            if (!attestationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Attestation attestation = attestationOpt.get();

            // Generate PDF receipt using iText PDF library
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            try (com.itextpdf.kernel.pdf.PdfDocument pdf = new com.itextpdf.kernel.pdf.PdfDocument(
                    new com.itextpdf.kernel.pdf.PdfWriter(baos))) {

                com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdf,
                        com.itextpdf.kernel.geom.PageSize.A4);

                try {
                    // Set up fonts
                    com.itextpdf.kernel.font.PdfFont titleFont = com.itextpdf.kernel.font.PdfFontFactory.createFont(
                            com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
                    com.itextpdf.kernel.font.PdfFont bodyFont = com.itextpdf.kernel.font.PdfFontFactory.createFont(
                            com.itextpdf.io.font.constants.StandardFonts.HELVETICA);

                    // Add title
                    String titleText = "Reçu d'Attestation - " + getTypeLabel(attestation.getType());
                    com.itextpdf.layout.element.Paragraph title = new com.itextpdf.layout.element.Paragraph(titleText)
                            .setFont(titleFont)
                            .setFontSize(16)
                            .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER)
                            .setBold();
                    document.add(title);

                    // Add date and time
                    java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter
                            .ofPattern("dd/MM/yyyy");
                    String formattedDate = attestation.getCreatedAt() != null
                            ? attestation.getCreatedAt().format(dateFormatter)
                            : "N/A";

                    document.add(new com.itextpdf.layout.element.Paragraph("Date: " + formattedDate)
                            .setFont(bodyFont)
                            .setFontSize(12)
                            .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.RIGHT)
                            .setMarginTop(10));

                    // Create a table for the receipt info
                    com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(
                            new float[] { 40, 60 })
                            .setWidth(com.itextpdf.layout.properties.UnitValue.createPercentValue(100))
                            .setMarginTop(20);

                    // Add rows to the table
                    addTableRow(table, "Type d'attestation:", getTypeLabel(attestation.getType()), bodyFont);
                    addTableRow(table, "Status:", attestation.getStatus(), bodyFont);
                    addTableRow(table, "Nom:", attestation.getNom(), bodyFont);
                    addTableRow(table, "Prénom:", attestation.getPrenom(), bodyFont);
                    addTableRow(table, "CIN:", attestation.getCin() != null ? attestation.getCin() : "N/A", bodyFont);
                    addTableRow(table, "IF:", attestation.getIfValue() != null ? attestation.getIfValue() : "N/A",
                            bodyFont);
                    addTableRow(table, "Email:", attestation.getEmail() != null ? attestation.getEmail() : "N/A",
                            bodyFont);
                    addTableRow(table, "Téléphone:", attestation.getPhone() != null ? attestation.getPhone() : "N/A",
                            bodyFont);

                    // Add the table to the document
                    document.add(table);

                    // Add footer text
                    document.add(
                            new com.itextpdf.layout.element.Paragraph(
                                    "Ce reçu confirme la création de votre attestation. " +
                                            "Veuillez conserver ce document.")
                                    .setFont(bodyFont)
                                    .setFontSize(10)
                                    .setTextAlignment(com.itextpdf.layout.properties.TextAlignment.CENTER)
                                    .setMarginTop(30));

                    document.close();

                    return ResponseEntity.ok()
                            .header("Content-Type", "application/pdf")
                            .header("Content-Disposition",
                                    "attachment; filename=\"attestation_receipt_" + id + ".pdf\"")
                            .body(baos.toByteArray());
                } catch (Exception e) {
                    document.close();
                    throw e;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void addTableRow(com.itextpdf.layout.element.Table table, String label, String value,
            com.itextpdf.kernel.font.PdfFont font) {
        com.itextpdf.layout.element.Cell labelCell = new com.itextpdf.layout.element.Cell()
                .add(new com.itextpdf.layout.element.Paragraph(label).setFont(font).setFontSize(12))
                .setBold()
                .setBackgroundColor(com.itextpdf.kernel.colors.ColorConstants.LIGHT_GRAY, 0.5f);

        com.itextpdf.layout.element.Cell valueCell = new com.itextpdf.layout.element.Cell()
                .add(new com.itextpdf.layout.element.Paragraph(value).setFont(font).setFontSize(12));

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    // Export attestations to Excel file with GET/POST method
    @RequestMapping(value = "/exportExcel", method = { RequestMethod.GET, RequestMethod.POST })
    public void exportExcelWithToken(HttpServletResponse response) throws IOException {
        try {
            System.out.println("DEBUG: ExportExcel endpoint called for attestations");

            // Set response headers first to enable download even if there's an exception
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=attestations.xlsx");

            // Set CORS headers explicitly for direct browser download
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Auth-Token");
            response.setHeader("Access-Control-Expose-Headers", "Content-Disposition");

            List<Attestation> attestations = attestationRepository.findAll();
            System.out.println("DEBUG: ExportExcel - Found " + attestations.size() + " attestations to export");

            // Create workbook and sheet
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Attestations");

            // Create header row
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // Set header cell values
            String[] columns = {
                    "ID", "CIN", "IF", "Nom", "Prénom", "Email", "Téléphone",
                    "Type d'attestation", "Statut", "Date de création", "Date de mise à jour", "Créé par"
            };

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            int rowNum = 1;

            for (Attestation attestation : attestations) {
                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(attestation.getId());
                row.createCell(1).setCellValue(attestation.getCin() != null ? attestation.getCin() : "");
                row.createCell(2).setCellValue(attestation.getIfValue() != null ? attestation.getIfValue() : "");
                row.createCell(3).setCellValue(attestation.getNom() != null ? attestation.getNom() : "");
                row.createCell(4).setCellValue(attestation.getPrenom() != null ? attestation.getPrenom() : "");
                row.createCell(5).setCellValue(attestation.getEmail() != null ? attestation.getEmail() : "");
                row.createCell(6).setCellValue(attestation.getPhone() != null ? attestation.getPhone() : "");
                row.createCell(7).setCellValue(
                        attestation.getType() != null ? getTypeLabel(attestation.getType()) : "");
                row.createCell(8).setCellValue(attestation.getStatus() != null ? attestation.getStatus() : "");
                row.createCell(9).setCellValue(
                        attestation.getCreatedAt() != null ? attestation.getCreatedAt().format(dateFormatter) : "");
                row.createCell(10).setCellValue(
                        attestation.getUpdatedAt() != null ? attestation.getUpdatedAt().format(dateFormatter) : "");
                row.createCell(11).setCellValue(
                        attestation.getCreator() != null ? attestation.getCreator().getUsername() : "");
            }

            // Auto-size columns for better readability
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to response output stream
            System.out.println("DEBUG: ExportExcel - Writing attestations to output stream");
            workbook.write(response.getOutputStream());
            workbook.close();

            System.out.println("DEBUG: ExportExcel - Completed successfully");
        } catch (Exception e) {
            System.err.println("ERROR: ExportExcel - " + e.getMessage());
            e.printStackTrace();
            // Don't rethrow to prevent response error
        }
    }

    private String getTypeLabel(String type) {
        switch (type) {
            case "revenu_globale":
                return "Attestation de Revenu Globale";
            case "tva_logement_social":
                return "Attestation d'Assujettissement au TVA Logement Social";
            case "renseignement_deces":
                return "Attestation Renseignement Décès";
            case "depart_definitif":
                return "Attestation Départ Définitif";
            default:
                return type;
        }
    }
}