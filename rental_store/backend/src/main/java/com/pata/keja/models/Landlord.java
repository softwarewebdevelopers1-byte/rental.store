package com.pata.keja.models;

import com.pata.keja.enums.UserRoles;
import com.pata.keja.enums.VerificationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "landlords")
@PrimaryKeyJoinColumn(name = "user_id")
public class Landlord extends User {

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 24)
    private VerificationStatus verificationStatus = VerificationStatus.NOT_REQUESTED;

    @Column(name = "verification_requested_at")
    private Instant verificationRequestedAt;

    @Column(name = "verification_decided_at")
    private Instant verificationDecidedAt;

    @Column(name = "verification_notes", length = 1000)
    private String verificationNotes;

    @OneToMany(mappedBy = "landlord", fetch = FetchType.LAZY)
    private List<Hostel> hostels = new ArrayList<>();

    public Landlord() {
        setRole(UserRoles.LANDLORD);
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public Instant getVerificationRequestedAt() {
        return verificationRequestedAt;
    }

    public void setVerificationRequestedAt(Instant verificationRequestedAt) {
        this.verificationRequestedAt = verificationRequestedAt;
    }

    public Instant getVerificationDecidedAt() {
        return verificationDecidedAt;
    }

    public void setVerificationDecidedAt(Instant verificationDecidedAt) {
        this.verificationDecidedAt = verificationDecidedAt;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public List<Hostel> getHostels() {
        return hostels;
    }

    public void setHostels(List<Hostel> hostels) {
        this.hostels = hostels;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Landlord))
            return false;
        return super.equals(o);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }

}
