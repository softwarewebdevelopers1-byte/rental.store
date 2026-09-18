package com.pata.keja.dto.messaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record SendMessageRequest(

        @NotBlank @Size(max = 4000) String body,

        List<@Size(max = 512) String> attachments) {
}
