package com.tests.demo.DTO;

import jakarta.validation.constraints.NotEmpty;

public record StudentDTO(
                @NotEmpty(message = "Name field should not be empty") String fullName,
                Long adm,
                Integer school_id) {

}
