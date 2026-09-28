package com.pata.keja.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import com.pata.keja.payment.PaymentProvider;
import com.pata.keja.payment.mock.MockPaymentProvider;
import com.pata.keja.payment.payhero.PayHeroPaymentProvider;

@Configuration
public class PaymentProviderConfig {

    @Bean
    public PaymentProvider paymentProvider(
            @Value("${app.payments.provider:auto}") String provider,
            PayHeroPaymentProvider payhero,
            MockPaymentProvider mock,
            PayHeroProperties props) {
        if ("payhero".equalsIgnoreCase(provider)) {
            return payhero;
        }
        if ("mock".equalsIgnoreCase(provider)) {
            return mock;
        }
        if ("auto".equalsIgnoreCase(provider)) {
            boolean hasCredentials = props.username() != null && !props.username().isBlank()
                    || props.password() != null && !props.password().isBlank()
                    || props.channelId() != null && !props.channelId().isBlank();
            if (!hasCredentials) {
                return mock;
            }
            if (props.username() == null || props.username().isBlank()
                    || props.password() == null || props.password().isBlank()
                    || props.channelId() == null || props.channelId().isBlank()) {
                throw new IllegalStateException(
                        "PayHero credentials are incomplete; configure username, password, and channel ID");
            }
            return payhero;
        }
        throw new IllegalArgumentException("Unsupported payment provider: " + provider);
    }

    @Bean
    public RestTemplate payHeroRestTemplate(PayHeroProperties props) {
        int timeoutMillis = Math.max(1, props.timeoutSeconds()) * 1000;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(timeoutMillis);
        factory.setReadTimeout(timeoutMillis);
        return new RestTemplate(factory);
    }
}
