package com.pata.keja.mapper;

import com.pata.keja.dto.admin.AdminResponse;
import com.pata.keja.dto.admin.AdminSummaryResponse;
import com.pata.keja.models.Admin;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {

    public AdminSummaryResponse toSummary(Admin a) {
        return new AdminSummaryResponse(
                a.getId(),
                a.getName(),
                a.getEmail(),
                a.isActive(),
                a.getCreatedAt());
    }

    public AdminResponse toResponse(Admin a) {
        return new AdminResponse(
                a.getId(),
                a.getName(),
                a.getEmail(),
                a.getPhone(),
                a.getAvatarUrl(),
                a.getRole(),
                a.isActive(),
                a.getCreatedAt(),
                a.getUpdatedAt());
    }
}
