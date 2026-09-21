package com.pata.keja.dto.hostel;

import java.util.List;

public record HostelPaymentRecorderResponse(
        String hostelId,
        List<RecorderSummary> permitted,
        List<RecorderSummary> notPermitted) {
}
