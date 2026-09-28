package com.pata.keja.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.payments.payhero")
public record PayHeroProperties(
        String baseUrl,
        String username,
        String password,
        String channelId,
        String callbackUrl,
        int timeoutSeconds) {
}
