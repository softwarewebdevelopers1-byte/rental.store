package com.pata.keja.models;

import com.pata.keja.enums.OrderStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.Instant;
import java.util.Objects;

@Embeddable
public class OrderTimelineEntry {

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private OrderStatus status;

    @Column(name = "at", nullable = false)
    private Instant at;

    @Column(name = "note", length = 500)
    private String note;

    public OrderTimelineEntry() {
    }

    public OrderTimelineEntry(OrderStatus status, Instant at, String note) {
        this.status = status;
        this.at = at;
        this.note = note;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Instant getAt() {
        return at;
    }

    public void setAt(Instant at) {
        this.at = at;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof OrderTimelineEntry))
            return false;
        OrderTimelineEntry other = (OrderTimelineEntry) o;
        return status == other.status && Objects.equals(at, other.at);
    }

    @Override
    public int hashCode() {
        return Objects.hash(status, at);
    }
}
