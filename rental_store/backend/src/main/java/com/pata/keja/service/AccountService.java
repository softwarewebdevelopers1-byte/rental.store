package com.pata.keja.service;

import com.pata.keja.dto.account.AccountUpdateRequest;
import com.pata.keja.dto.admin.UserSummaryResponse;

public interface AccountService {
    UserSummaryResponse getCurrent();

    UserSummaryResponse updateCurrent(AccountUpdateRequest request);
}
