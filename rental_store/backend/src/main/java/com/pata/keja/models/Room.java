package com.pata.keja.models;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

import com.pata.keja.enums.RoomStatus;

@Entity
@Table(name = "rooms", uniqueConstraints = @UniqueConstraint(name = "uk_rooms_hostel_number", columnNames = {
        "hostel_id", "number" }), indexes = {
                @Index(name = "idx_rooms_hostel", columnList = "hostel_id"),
                @Index(name = "idx_rooms_status", columnList = "status"),
                @Index(name = "idx_rooms_tenant", columnList = "tenant_id")
        })
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hostel_id", nullable = false)
    private Hostel hostel;

    @Column(name = "number", nullable = false, length = 16)
    private String number;

    /**
     * Rent amount in smallest currency unit (KES shillings if whole).
     * Using long avoids floating-point money bugs.
     */
    @Column(name = "price", nullable = false)
    private long price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private RoomStatus status = RoomStatus.VACANT;

    /**
     * The student currently occupying this room. Null when VACANT.
     * Inverse side of Student.room.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", unique = true)
    private Student tenant;

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

    // Getters / setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Hostel getHostel() {
        return hostel;
    }

    public void setHostel(Hostel hostel) {
        this.hostel = hostel;
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public long getPrice() {
        return price;
    }

    public void setPrice(long price) {
        this.price = price;
    }

    public RoomStatus getStatus() {
        return status;
    }

    public void setStatus(RoomStatus status) {
        this.status = status;
    }

    public Student getTenant() {
        return tenant;
    }

    public void setTenant(Student tenant) {
        this.tenant = tenant;
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
        if (!(o instanceof Room))
            return false;
        Room other = (Room) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
