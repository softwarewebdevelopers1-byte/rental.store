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
         * service if null. Max 365.
         */
        Integer expiresInDays) {
}
