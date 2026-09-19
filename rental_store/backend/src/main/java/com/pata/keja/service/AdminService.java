package com.pata.keja.service;

import com.pata.keja.dto.admin.AdminCreateRequest;
import com.pata.keja.dto.admin.AdminResponse;
import com.pata.keja.dto.admin.AdminSummaryResponse;
import com.pata.keja.dto.admin.PlatformStatsResponse;
import com.pata.keja.dto.admin.UserSummaryResponse;
import com.pata.keja.dto.landlord.LandlordResponse;
import com.pata.keja.dto.landlord.LandlordSummaryResponse;
import com.pata.keja.dto.landlord.VerificationDecisionRequest;
import com.pata.keja.enums.UserRoles;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminService {

    Page<AdminSummaryResponse> list(Pageable pageable);

    AdminResponse getById(String adminId);

    AdminResponse create(AdminCreateRequest req);

    void setActive(String adminId, boolean active);

    PlatformStatsResponse stats();

    Page<LandlordSummaryResponse> listVerificationRequests(Pageable pageable);

    LandlordResponse decideVerification(String landlordId, VerificationDecisionRequest req);

    Page<UserSummaryResponse> listUsers(String q, UserRoles role, Pageable pageable);

    Page<UserSummaryResponse> listUsersByIds(List<String> ids, Pageable pageable);

    UserSummaryResponse getUser(String userId);
}
