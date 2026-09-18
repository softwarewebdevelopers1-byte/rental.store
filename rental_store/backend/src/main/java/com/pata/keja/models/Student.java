package com.pata.keja.models;

import jakarta.persistence.*;
import java.util.Objects;

import com.pata.keja.enums.MembershipStatus;
import com.pata.keja.enums.UserRoles;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_students_hostel", columnList = "hostel_id"),
        @Index(name = "idx_students_requested_hostel", columnList = "requested_hostel_id"),
        @Index(name = "idx_students_membership", columnList = "membership_status")
})
@PrimaryKeyJoinColumn(name = "user_id")
public class Student extends User {

    /**
     * The hostel the student is currently an active tenant of.
     * Null until a landlord accepts their request.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id")
    private Hostel hostel;

    /**
     * The room the student currently occupies.
     * Null until they are assigned a room.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    /**
     * Pending hostel the student has requested to join.
     * Null unless membershipStatus == PENDING.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_hostel_id")
    private Hostel requestedHostel;

    @Enumerated(EnumType.STRING)
    @Column(name = "membership_status", nullable = false, length = 24)
    private MembershipStatus membershipStatus = MembershipStatus.PENDING;

    /**
     * The hostel code the student entered at registration.
     * Kept for audit / support purposes even after the request is resolved.
     */
    @Column(name = "registration_hostel_code", length = 32)
    private String registrationHostelCode;

    @Column(name = "requested_at")
    private java.time.Instant requestedAt;

    @Column(name = "activated_at")
    private java.time.Instant activatedAt;

    public Student() {
        setRole(UserRoles.STUDENT);
    }

    // Getters / setters
    public Hostel getHostel() {
        return hostel;
    }

    public void setHostel(Hostel hostel) {
        this.hostel = hostel;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public Hostel getRequestedHostel() {
        return requestedHostel;
    }

    public void setRequestedHostel(Hostel requestedHostel) {
        this.requestedHostel = requestedHostel;
    }

    public MembershipStatus getMembershipStatus() {
        return membershipStatus;
    }

    public void setMembershipStatus(MembershipStatus membershipStatus) {
        this.membershipStatus = membershipStatus;
    }

    public String getRegistrationHostelCode() {
        return registrationHostelCode;
    }

    public void setRegistrationHostelCode(String registrationHostelCode) {
        this.registrationHostelCode = registrationHostelCode;
    }

    public java.time.Instant getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(java.time.Instant requestedAt) {
        this.requestedAt = requestedAt;
    }

    public java.time.Instant getActivatedAt() {
        return activatedAt;
    }

    public void setActivatedAt(java.time.Instant activatedAt) {
        this.activatedAt = activatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Student))
            return false;
        return super.equals(o);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
