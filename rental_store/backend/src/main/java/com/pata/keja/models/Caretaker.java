package com.pata.keja.models;

import com.pata.keja.enums.UserRoles;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "caretakers")
@PrimaryKeyJoinColumn(name = "user_id")
public class Caretaker extends User {

    /**
     * Hostels this caretaker is assigned to. Many-to-many because a caretaker
     * may cover more than one hostel, and a hostel may have more than one
     * caretaker.
     */
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "caretaker_hostels", joinColumns = @JoinColumn(name = "caretaker_id"), inverseJoinColumns = @JoinColumn(name = "hostel_id"), indexes = {
            @Index(name = "idx_caretaker_hostels_hostel", columnList = "hostel_id")
    })
    private Set<Hostel> assignedHostels = new HashSet<>();

    public Caretaker() {
        setRole(UserRoles.CARETAKER);
    }

    public void assign(Hostel hostel) {
        assignedHostels.add(hostel);
    }

    public void unassign(Hostel hostel) {
        assignedHostels.remove(hostel);
    }

    // Getters / setters
    public Set<Hostel> getAssignedHostels() {
        return assignedHostels;
    }

    public void setAssignedHostels(Set<Hostel> assignedHostels) {
        this.assignedHostels = assignedHostels;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Caretaker))
            return false;
        return super.equals(o);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
