package com.pata.keja.service;

import com.pata.keja.dto.landlord.LandlordResponse;
import com.pata.keja.dto.landlord.LandlordStatsResponse;
import com.pata.keja.dto.landlord.LandlordSummaryResponse;
import com.pata.keja.dto.landlord.LandlordUpdateRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface LandlordService {

    LandlordResponse getCurrent();

    LandlordResponse updateCurrent(LandlordUpdateRequest req);

    LandlordResponse requestVerification();

    LandlordStatsResponse getStats();

    LandlordResponse getById(String id);

    Page<LandlordSummaryResponse> list(Pageable pageable);
}
