package com.pata.keja.models;

import com.pata.keja.enums.InvitationKind;
import com.pata.keja.enums.InvitationStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.Objects;

@Entity
@Table(name = "invitations", uniqueConstraints = @UniqueConstraint(name = "uk_invitations_token", columnNames = "token"), indexes = {
        @Index(name = "idx_invitations_status", columnList = "status"),
        @Index(name = "idx_invitations_expires", columnList = "expires_at"),
        @Index(name = "idx_invitations_kind", columnList = "kind"),
        @Index(name = "idx_invitations_email", columnList = "email")
})
public class Invitation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false, length = 36)
    private String id;

    /**
     * The URL-safe token used in the invite link.
     * Unique. Opaque. Not guessable. Rotated by generating a new invitation.
     */
    @Column(name = "token", nullable = false, unique = true, length = 64)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 24)
    private InvitationKind kind;

    /**
     * Optional — for record-keeping. Invitations can also be shared as bare links.
     */
    @Column(name = "email", length = 180)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private InvitationStatus status = InvitationStatus.ACTIVE;

    /** The admin who issued the invitation. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private Admin createdBy;

    /** Set when the invitation is redeemed. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "used_by")
    private User usedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @PrePersist
    void onCreate() {
        if (this.createdAt == null)
            this.createdAt = Instant.now();
        if (this.status == null)
            this.status = InvitationStatus.ACTIVE;
    }

    // Convenience transitions
    public void markUsed(User user) {
        this.status = InvitationStatus.USED;
        this.usedAt = Instant.now();
        this.usedBy = user;
    }

    public void revoke() {
        if (this.status == InvitationStatus.ACTIVE) {
            this.status = InvitationStatus.REVOKED;
            this.revokedAt = Instant.now();
        }
    }

    public boolean isExpired(Instant now) {
        return expiresAt != null && expiresAt.isBefore(now);
    }

    public boolean isRedeemable(Instant now) {
        return status == InvitationStatus.ACTIVE && !isExpired(now);
    }

    // Getters / setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public InvitationKind getKind() {
        return kind;
    }

    public void setKind(InvitationKind kind) {
        this.kind = kind;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }

    public Admin getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Admin createdBy) {
        this.createdBy = createdBy;
    }

    public User getUsedBy() {
        return usedBy;
    }

    public void setUsedBy(User usedBy) {
        this.usedBy = usedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Invitation))
            return false;
        Invitation other = (Invitation) o;
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
