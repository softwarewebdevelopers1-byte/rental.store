package com.pata.keja.models;

import com.pata.keja.enums.UserRoles;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

import java.util.Objects;

@Entity
@Table(name = "market_agents")
@PrimaryKeyJoinColumn(name = "user_id")
public class MarketAgent extends User {

    /**
     * Optional trading name / business name.
     * Not the same as `name` (which is the person's full name).
     */
    @Column(name = "business_name", length = 160)
    private String businessName;

    public MarketAgent() {
        setRole(UserRoles.MARKET_AGENT);
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof MarketAgent))
            return false;
        return super.equals(o);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
