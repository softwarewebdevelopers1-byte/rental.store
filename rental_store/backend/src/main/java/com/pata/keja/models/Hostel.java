package com.pata.keja.models;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

@Entity
@Table(name = "hostels", indexes = {
        @Index(name = "idx_hostels_code", columnList = "code", unique = true),
        @Index(name = "idx_hostels_landlord", columnList = "landlord_id"),
        @Index(name = "idx_hostels_location", columnList = "location"),
        @Index(name = "idx_hostels_active", columnList = "active")
})
public class Hostel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false, length = 36)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "landlord_id", nullable = false)
    private Landlord landlord;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 32)
    private String code;

    @Column(name = "location", nullable = false, length = 200)
    private String location;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "hostel_images", joinColumns = @JoinColumn(name = "hostel_id"))
    @Column(name = "image_url", length = 512)
    @OrderColumn(name = "position")
    private List<String> images = new ArrayList<>();

    @Column(name = "rating", nullable = false)
    private double rating = 0.0;

    @Column(name = "review_count", nullable = false)
    private int reviewCount = 0;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    /**
     * Inverse side of Caretaker.assignedHostels.
     * Use SUBSELECT to load all caretakers in a single subselect query.
     * No cascade — a hostel does not own its caretakers.
     */
    @ManyToMany(mappedBy = "assignedHostels", fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    private Set<Caretaker> caretakers = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "hostel_payment_recorders",
            joinColumns = @JoinColumn(name = "hostel_id"),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_hostel_payment_recorder",
                    columnNames = { "hostel_id", "caretaker_id" }))
    @Column(name = "caretaker_id", length = 36)
    private Set<String> paymentRecorderCaretakerIds = new HashSet<>();

    /**
     * Rooms in this hostel. Owned side is Room.hostel.
     * Use SUBSELECT to load all rooms in a single subselect query, avoiding N+1.
     */
    @OneToMany(mappedBy = "hostel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    private List<Room> rooms = new ArrayList<>();

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

    // Bidirectional helpers
    public void addRoom(Room room) {
        rooms.add(room);
        room.setHostel(this);
    }

    public void removeRoom(Room room) {
        rooms.remove(room);
        room.setHostel(null);
    }

    // Getters / setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Landlord getLandlord() {
        return landlord;
    }

    public void setLandlord(Landlord landlord) {
        this.landlord = landlord;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Set<Caretaker> getCaretakers() {
        return caretakers;
    }

    public void setCaretakers(Set<Caretaker> caretakers) {
        this.caretakers = caretakers;
    }

    public Set<String> getPaymentRecorderCaretakerIds() {
        return paymentRecorderCaretakerIds;
    }

    public void setPaymentRecorderCaretakerIds(Set<String> paymentRecorderCaretakerIds) {
        this.paymentRecorderCaretakerIds = paymentRecorderCaretakerIds;
    }

    public boolean canRecordPayments(String caretakerId) {
        return paymentRecorderCaretakerIds.contains(caretakerId);
    }

    public List<Room> getRooms() {
        return rooms;
    }

    public void setRooms(List<Room> rooms) {
        this.rooms = rooms;
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
        if (!(o instanceof Hostel))
            return false;
        Hostel other = (Hostel) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
