package com.pata.keja.dto.invitation;

import com.pata.keja.enums.InvitationKind;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record InvitationCreateRequest(

        @NotNull InvitationKind kind,

        @Email @Size(max = 180) String email,

        /**
         * Days until the invitation expires. Optional — defaults to 30 in the
         * service if both duration fields are null. Max 365.
         */
        Integer expiresInDays,

        /**
         * Hours until the invitation expires. Takes precedence over days when
         * both are supplied. Max 8760 (365 days).
         */
        Integer expiresInHours) {
}
