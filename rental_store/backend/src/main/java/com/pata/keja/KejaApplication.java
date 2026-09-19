package com.pata.keja;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import com.pata.keja.config.StorageProperties;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableMethodSecurity
@EnableConfigurationProperties(StorageProperties.class)
public class KejaApplication {

    public static void main(String[] args) {
        SpringApplication.run(KejaApplication.class, args);
    }

}
