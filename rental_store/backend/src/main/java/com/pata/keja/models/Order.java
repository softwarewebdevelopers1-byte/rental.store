package com.pata.keja.models;

import com.pata.keja.enums.OrderStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "orders", indexes = {
        @Index(name = "idx_orders_student", columnList = "student_id"),
        @Index(name = "idx_orders_agent", columnList = "agent_id"),
        @Index(name = "idx_orders_status", columnList = "status"),
        @Index(name = "idx_orders_created", columnList = "created_at")
})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agent_id", nullable = false)
    private MarketAgent agent;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "kind", column = @Column(name = "kind", length = 16)),
            @AttributeOverride(name = "refId", column = @Column(name = "ref_id", length = 36)),
            @AttributeOverride(name = "name", column = @Column(name = "name", length = 200)),
            @AttributeOverride(name = "unitPrice", column = @Column(name = "unit_price")),
            @AttributeOverride(name = "quantity", column = @Column(name = "quantity"))
    })
    @OrderColumn(name = "position")
    private List<OrderItem> items = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "order_timeline", joinColumns = @JoinColumn(name = "order_id"))
    @AttributeOverrides({
            @AttributeOverride(name = "status", column = @Column(name = "status", length = 32)),
            @AttributeOverride(name = "at", column = @Column(name = "at")),
            @AttributeOverride(name = "note", column = @Column(name = "note", length = 500))
    })
    @OrderColumn(name = "position")
    private List<OrderTimelineEntry> timeline = new ArrayList<>();

    @Column(name = "total", nullable = false)
    private long total;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Convenience
    public void addTimelineEntry(OrderStatus status, String note) {
        this.timeline.add(new OrderTimelineEntry(status, Instant.now(), note));
    }

    // Getters / setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public MarketAgent getAgent() {
        return agent;
    }

    public void setAgent(MarketAgent agent) {
        this.agent = agent;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public List<OrderTimelineEntry> getTimeline() {
        return timeline;
    }

    public void setTimeline(List<OrderTimelineEntry> timeline) {
        this.timeline = timeline;
    }

    public long getTotal() {
        return total;
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Order))
            return false;
        Order other = (Order) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
