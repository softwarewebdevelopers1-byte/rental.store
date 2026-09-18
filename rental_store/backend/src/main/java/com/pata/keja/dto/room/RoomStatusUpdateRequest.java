package com.pata.keja.dto.room;

import com.pata.keja.enums.RoomStatus;

import jakarta.validation.constraints.NotNull;

public record RoomStatusUpdateRequest(

        @NotNull RoomStatus status) {
}
