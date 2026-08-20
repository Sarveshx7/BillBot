package com.billbot.repository;

import com.billbot.entity.Invoice;
import com.billbot.entity.InvoiceItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, UUID> {

    List<InvoiceItem> findByInvoice(Invoice invoice);
}
