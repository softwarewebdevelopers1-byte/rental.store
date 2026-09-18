package com.pata.keja.service;

import com.pata.keja.enums.MaintenanceStatus;
import com.pata.keja.dto.maintenance.*;

import java.util.List;

public interface MaintenanceService {

    List<MaintenanceSummaryResponse> listForStudent(String studentId);

    List<MaintenanceSummaryResponse> listForHostels(List<String> hostelIds, MaintenanceStatus filter);

    MaintenanceResponse getById(String id);

    MaintenanceResponse create(String studentId, MaintenanceCreateRequest req);

    MaintenanceResponse updateStatus(String id, MaintenanceStatus status);
}
