package com.pata.keja.payment.payhero;

import com.pata.keja.exception.ConflictException;

public final class PayHeroPhoneNumber {

    private PayHeroPhoneNumber() {
    }

    public static String normalize(String value) {
        if (value == null || value.isBlank()) {
            throw new ConflictException("Enter a valid Kenyan M-Pesa phone number.");
        }

        String normalized = value.trim().replaceAll("[\\s()-]", "");
        if (normalized.matches("\\+254[17]\\d{8}")) {
            return normalized;
        }
        if (normalized.matches("254[17]\\d{8}")) {
            return "+" + normalized;
        }
        if (normalized.matches("0[17]\\d{8}")) {
            return "+254" + normalized.substring(1);
        }
        throw new ConflictException("Enter a valid Kenyan M-Pesa phone number.");
    }
}
