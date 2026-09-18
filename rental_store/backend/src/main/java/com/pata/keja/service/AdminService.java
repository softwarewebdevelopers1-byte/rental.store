package com.pata.keja.service;

import com.pata.keja.dto.admin.AdminCreateRequest;
import com.pata.keja.dto.admin.AdminResponse;
import com.pata.keja.dto.admin.AdminSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    Page<AdminSummaryResponse> list(Pageable pageable);

    AdminResponse getById(String adminId);

    AdminResponse create(AdminCreateRequest req);

    void setActive(String adminId, boolean active);
}
