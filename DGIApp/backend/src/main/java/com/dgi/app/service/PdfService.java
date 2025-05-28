package com.dgi.app.service;

import com.dgi.app.model.Request;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

        /**
         * Generates a PDF receipt for a request
         * 
         * @param request The request to generate a receipt for
         * @return Byte array of the generated PDF
         * @throws IOException If there's an error generating the PDF
         */
        public byte[] generateRequestReceipt(Request request) throws IOException {
                ByteArrayOutputStream baos = new ByteArrayOutputStream();
                PdfWriter writer = new PdfWriter(baos);
                PdfDocument pdf = new PdfDocument(writer);
                Document document = new Document(pdf, PageSize.A4);

                try {
                        // Set up fonts
                        PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
                        PdfFont bodyFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);

                        // Add title
                        Paragraph title = new Paragraph("Reçu de Dépôt de la demande à l'inscription à la TP")
                                        .setFont(titleFont)
                                        .setFontSize(16)
                                        .setTextAlignment(TextAlignment.CENTER)
                                        .setBold();
                        document.add(title);

                        // Add date and time
                        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                        String formattedDate = request.getDateEntree() != null
                                        ? request.getDateEntree().format(dateFormatter)
                                        : "N/A";

                        document.add(new Paragraph("Date: " + formattedDate)
                                        .setFont(bodyFont)
                                        .setFontSize(12)
                                        .setTextAlignment(TextAlignment.RIGHT)
                                        .setMarginTop(10));

                        // Create a table for the receipt info
                        Table table = new Table(UnitValue.createPercentArray(new float[] { 40, 60 }))
                                        .setWidth(UnitValue.createPercentValue(100))
                                        .setMarginTop(20);

                        // Add rows to the table
                        addTableRow(table, "Numéro d'Ordre:", String.valueOf(request.getId()), bodyFont);
                        // addTableRow(table, "Date d'entrée:", formattedDate, bodyFont);
                        addTableRow(table, "Nom/Entreprise:", request.getRaisonSocialeNomsPrenom(), bodyFont);
                        addTableRow(table, "Type:",
                                        request.getPmPp().equals("PP") ? "Personne Physique" : "Personne Morale",
                                        bodyFont);
                        addTableRow(table, "Objet:", request.getObjet() != null ? request.getObjet() : "N/A", bodyFont);
                        addTableRow(table, "CIN:", request.getCin() != null ? request.getCin() : "N/A", bodyFont);
                        addTableRow(table, "IF:", request.getIfValue() != null ? request.getIfValue() : "N/A",
                                        bodyFont);

                        // Add the table to the document
                        document.add(table);

                        // Add footer text
                        document.add(
                                        new Paragraph("Ce reçu confirme le dépôt de votre demande d'inscription à la TP. "
                                                        +
                                                        "Veuillez conserver ce document.")
                                                        .setFont(bodyFont)
                                                        .setFontSize(10)
                                                        .setTextAlignment(TextAlignment.CENTER)
                                                        .setMarginTop(30));

                        // Close the document
                        document.close();
                        return baos.toByteArray();
                } catch (Exception e) {
                        try {
                                document.close();
                        } catch (Exception closeException) {
                                // Ignore close errors
                        }
                        throw e;
                }
        }

        private void addTableRow(Table table, String label, String value, PdfFont font) {
                Cell labelCell = new Cell()
                                .add(new Paragraph(label).setFont(font).setFontSize(12))
                                .setBold()
                                .setBackgroundColor(ColorConstants.LIGHT_GRAY, 0.5f);

                Cell valueCell = new Cell()
                                .add(new Paragraph(value).setFont(font).setFontSize(12));

                table.addCell(labelCell);
                table.addCell(valueCell);
        }
}