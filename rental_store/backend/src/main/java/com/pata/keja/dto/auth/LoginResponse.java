package com.pata.keja.dto.auth;

import com.pata.keja.dto.admin.UserSummaryResponse;

public record LoginResponse(String token, UserSummaryResponse user) {
}
