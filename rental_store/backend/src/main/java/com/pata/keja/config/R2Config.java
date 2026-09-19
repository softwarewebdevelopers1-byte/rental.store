package com.pata.keja.config;

import java.net.URI;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class R2Config {

    @Bean
    public S3Client s3Client(StorageProperties props) {
        if (props.endpoint() == null || props.endpoint().isBlank()) {
            throw new IllegalStateException(
                    "Cloudflare R2 is not configured: set R2_ENDPOINT before starting the application");
        }
        return S3Client.builder()
                .endpointOverride(URI.create(props.endpoint()))
                .region(Region.of(props.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(props.accessKey(), props.secretKey())))
                .forcePathStyle(true)
                .build();
    }
}
