package com.pata.keja;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableMethodSecurity
public class KejaApplication {

    public static void main(String[] args) {
        SpringApplication.run(KejaApplication.class, args);
    }

}
