package com.pata.keja.dto.room;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RoomCreateRequest(

        @NotBlank @Size(max = 16) String number,

        @NotNull @Min(0) Long price) {
}
