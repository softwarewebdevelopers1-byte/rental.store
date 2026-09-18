package com.pata.keja.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.util.Objects;

@Embeddable
public class OrderItem {

    public enum Kind {
        PRODUCT, PACK
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 16)
    private Kind kind;

    /** Loose reference — no FK. Snapshot semantics. */
    @Column(name = "ref_id", nullable = false, length = 36)
    private String refId;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "unit_price", nullable = false)
    private long unitPrice;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    public OrderItem() {
    }

    public OrderItem(Kind kind, String refId, String name, long unitPrice, int quantity) {
        this.kind = kind;
        this.refId = refId;
        this.name = name;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
    }

    public long lineTotal() {
        return unitPrice * quantity;
    }

    public Kind getKind() {
        return kind;
    }

    public void setKind(Kind kind) {
        this.kind = kind;
    }

    public String getRefId() {
        return refId;
    }

    public void setRefId(String refId) {
        this.refId = refId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public long getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(long unitPrice) {
        this.unitPrice = unitPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof OrderItem))
            return false;
        OrderItem other = (OrderItem) o;
        return unitPrice == other.unitPrice
                && quantity == other.quantity
                && kind == other.kind
                && Objects.equals(refId, other.refId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(kind, refId, unitPrice, quantity);
    }
}
