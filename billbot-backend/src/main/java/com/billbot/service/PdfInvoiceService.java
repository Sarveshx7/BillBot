package com.billbot.service;

import com.billbot.entity.*;
import com.billbot.repository.InvoiceRepository;
import com.billbot.repository.UserRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PdfInvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public PdfInvoiceService(InvoiceRepository invoiceRepository, UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    public byte[] generateInvoicePdf(UUID invoiceId, String userId) {
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Invoice invoice = invoiceRepository.findByIdAndUser(invoiceId, user)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + invoiceId));

        Customer customer = invoice.getCustomer();
        DecimalFormat currencyFmt = new DecimalFormat("#,##0.00");
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Color Palette
            Color primaryColor = new Color(79, 70, 229); // Indigo 600
            Color darkColor = new Color(30, 41, 59);    // Slate 800
            Color lightBg = new Color(248, 250, 252);   // Slate 50
            Color borderColor = new Color(226, 232, 240); // Slate 200
            Color textMuted = new Color(100, 116, 139); // Slate 500

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryColor);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, darkColor);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkColor);
            Font regularFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkColor);
            Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9, textMuted);

            // =========================
            // TOP HEADER TABLE
            // =========================
            PdfPTable topTable = new PdfPTable(2);
            topTable.setWidthPercentage(100);
            topTable.setWidths(new float[]{60, 40});

            // Business Info (Left)
            PdfPCell businessCell = new PdfPCell();
            businessCell.setBorder(Rectangle.NO_BORDER);

            String bName = (user.getBusinessName() != null && !user.getBusinessName().isBlank())
                    ? user.getBusinessName() : user.getName();

            Paragraph pBiz = new Paragraph(bName, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, darkColor));
            businessCell.addElement(pBiz);

            if (user.getBusinessAddress() != null && !user.getBusinessAddress().isBlank()) {
                businessCell.addElement(new Paragraph(user.getBusinessAddress(), mutedFont));
            }
            if (user.getBusinessPhone() != null && !user.getBusinessPhone().isBlank()) {
                businessCell.addElement(new Paragraph("Phone: " + user.getBusinessPhone(), mutedFont));
            }
            businessCell.addElement(new Paragraph("Email: " + user.getEmail(), mutedFont));
            if (user.getTaxNumber() != null && !user.getTaxNumber().isBlank()) {
                businessCell.addElement(new Paragraph("Tax/GSTIN: " + user.getTaxNumber(), mutedFont));
            }

            topTable.addCell(businessCell);

            // Invoice Meta (Right)
            PdfPCell invoiceMetaCell = new PdfPCell();
            invoiceMetaCell.setBorder(Rectangle.NO_BORDER);
            invoiceMetaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            Paragraph pInvTitle = new Paragraph("INVOICE", titleFont);
            pInvTitle.setAlignment(Element.ALIGN_RIGHT);
            invoiceMetaCell.addElement(pInvTitle);

            Paragraph pInvNo = new Paragraph("# " + invoice.getInvoiceNumber(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, darkColor));
            pInvNo.setAlignment(Element.ALIGN_RIGHT);
            invoiceMetaCell.addElement(pInvNo);

            Paragraph pDate = new Paragraph("Invoice Date: " + invoice.getInvoiceDate().format(dateFmt), regularFont);
            pDate.setAlignment(Element.ALIGN_RIGHT);
            invoiceMetaCell.addElement(pDate);

            Paragraph pDue = new Paragraph("Due Date: " + invoice.getDueDate().format(dateFmt), regularFont);
            pDue.setAlignment(Element.ALIGN_RIGHT);
            invoiceMetaCell.addElement(pDue);

            Paragraph pStatus = new Paragraph("Status: " + invoice.getStatus().name(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryColor));
            pStatus.setAlignment(Element.ALIGN_RIGHT);
            invoiceMetaCell.addElement(pStatus);

            topTable.addCell(invoiceMetaCell);
            document.add(topTable);

            document.add(new Paragraph(" "));

            // =========================
            // BILL TO TABLE
            // =========================
            PdfPTable billToTable = new PdfPTable(1);
            billToTable.setWidthPercentage(100);

            PdfPCell billToCell = new PdfPCell();
            billToCell.setBackgroundColor(lightBg);
            billToCell.setPadding(10);
            billToCell.setBorderColor(borderColor);

            billToCell.addElement(new Paragraph("BILL TO:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, primaryColor)));
            billToCell.addElement(new Paragraph(customer.getName(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, darkColor)));
            if (customer.getCompanyName() != null && !customer.getCompanyName().isBlank()) {
                billToCell.addElement(new Paragraph(customer.getCompanyName(), regularFont));
            }
            if (customer.getBillingAddress() != null && !customer.getBillingAddress().isBlank()) {
                billToCell.addElement(new Paragraph(customer.getBillingAddress(), regularFont));
            }
            if (customer.getEmail() != null && !customer.getEmail().isBlank()) {
                billToCell.addElement(new Paragraph("Email: " + customer.getEmail(), mutedFont));
            }
            if (customer.getPhone() != null && !customer.getPhone().isBlank()) {
                billToCell.addElement(new Paragraph("Phone: " + customer.getPhone(), mutedFont));
            }
            if (customer.getTaxNumber() != null && !customer.getTaxNumber().isBlank()) {
                billToCell.addElement(new Paragraph("Tax ID: " + customer.getTaxNumber(), mutedFont));
            }

            billToTable.addCell(billToCell);
            document.add(billToTable);

            document.add(new Paragraph(" "));

            // =========================
            // ITEMS TABLE
            // =========================
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{40, 15, 15, 15, 15});

            String[] headers = {"Item & Description", "Qty", "Unit Price", "Tax", "Amount"};
            for (String h : headers) {
                PdfPCell headerCell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE)));
                headerCell.setBackgroundColor(primaryColor);
                headerCell.setPadding(6);
                headerCell.setBorderColor(primaryColor);
                if (!h.equals("Item & Description")) {
                    headerCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                }
                itemsTable.addCell(headerCell);
            }

            String curr = invoice.getCurrency();

            for (InvoiceItem item : invoice.getItems()) {
                PdfPCell nameCell = new PdfPCell();
                nameCell.setPadding(6);
                nameCell.setBorderColor(borderColor);
                nameCell.addElement(new Paragraph(item.getItemName(), boldFont));
                if (item.getDescription() != null && !item.getDescription().isBlank()) {
                    nameCell.addElement(new Paragraph(item.getDescription(), mutedFont));
                }
                itemsTable.addCell(nameCell);

                PdfPCell qtyCell = new PdfPCell(new Phrase(item.getQuantity().toString(), regularFont));
                qtyCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                qtyCell.setPadding(6);
                qtyCell.setBorderColor(borderColor);
                itemsTable.addCell(qtyCell);

                PdfPCell priceCell = new PdfPCell(new Phrase(curr + " " + currencyFmt.format(item.getUnitPrice()), regularFont));
                priceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                priceCell.setPadding(6);
                priceCell.setBorderColor(borderColor);
                itemsTable.addCell(priceCell);

                PdfPCell taxCell = new PdfPCell(new Phrase(item.getTaxRate() + "% (" + currencyFmt.format(item.getTaxAmount()) + ")", regularFont));
                taxCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                taxCell.setPadding(6);
                taxCell.setBorderColor(borderColor);
                itemsTable.addCell(taxCell);

                PdfPCell totalCell = new PdfPCell(new Phrase(curr + " " + currencyFmt.format(item.getTotalPrice()), boldFont));
                totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                totalCell.setPadding(6);
                totalCell.setBorderColor(borderColor);
                itemsTable.addCell(totalCell);
            }

            document.add(itemsTable);

            // =========================
            // TOTALS & SUMMARY
            // =========================
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{55, 45});

            // Notes / Terms Left cell
            PdfPCell notesCell = new PdfPCell();
            notesCell.setBorder(Rectangle.NO_BORDER);
            notesCell.setPaddingTop(10);

            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                notesCell.addElement(new Paragraph("Notes:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkColor)));
                notesCell.addElement(new Paragraph(invoice.getNotes(), mutedFont));
            }
            if (invoice.getTerms() != null && !invoice.getTerms().isBlank()) {
                notesCell.addElement(new Paragraph("Terms & Conditions:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkColor)));
                notesCell.addElement(new Paragraph(invoice.getTerms(), mutedFont));
            }
            summaryTable.addCell(notesCell);

            // Totals Right cell
            PdfPCell totalsCell = new PdfPCell();
            totalsCell.setBorder(Rectangle.NO_BORDER);
            totalsCell.setPaddingTop(10);

            PdfPTable innerTotals = new PdfPTable(2);
            innerTotals.setWidthPercentage(100);
            innerTotals.setWidths(new float[]{50, 50});

            addSummaryRow(innerTotals, "Subtotal:", curr + " " + currencyFmt.format(invoice.getSubtotal()), regularFont, regularFont, borderColor);
            addSummaryRow(innerTotals, "Tax Total:", curr + " " + currencyFmt.format(invoice.getTaxTotal()), regularFont, regularFont, borderColor);
            if (invoice.getDiscountTotal().compareTo(BigDecimal.ZERO) > 0) {
                addSummaryRow(innerTotals, "Discount:", "- " + curr + " " + currencyFmt.format(invoice.getDiscountTotal()), regularFont, regularFont, borderColor);
            }
            addSummaryRow(innerTotals, "Total Amount:", curr + " " + currencyFmt.format(invoice.getTotalAmount()), boldFont, boldFont, borderColor);
            addSummaryRow(innerTotals, "Amount Paid:", curr + " " + currencyFmt.format(invoice.getAmountPaid()), regularFont, regularFont, borderColor);

            PdfPCell dueLabel = new PdfPCell(new Phrase("Balance Due:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, primaryColor)));
            dueLabel.setBackgroundColor(lightBg);
            dueLabel.setPadding(6);
            dueLabel.setBorderColor(primaryColor);
            innerTotals.addCell(dueLabel);

            PdfPCell dueValue = new PdfPCell(new Phrase(curr + " " + currencyFmt.format(invoice.getAmountDue()), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, primaryColor)));
            dueValue.setBackgroundColor(lightBg);
            dueValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
            dueValue.setPadding(6);
            dueValue.setBorderColor(primaryColor);
            innerTotals.addCell(dueValue);

            totalsCell.addElement(innerTotals);
            summaryTable.addCell(totalsCell);

            document.add(summaryTable);

            // Footer note
            document.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("Thank you for your business!", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, textMuted));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating invoice PDF: " + e.getMessage(), e);
        }
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont, Color border) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, labelFont));
        lCell.setPadding(4);
        lCell.setBorderColor(border);
        table.addCell(lCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value, valueFont));
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vCell.setPadding(4);
        vCell.setBorderColor(border);
        table.addCell(vCell);
    }
}
