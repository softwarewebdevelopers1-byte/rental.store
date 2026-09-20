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
        if (props.endpoint() == null || props.endpoint().isBlank()
                || props.accessKey() == null || props.accessKey().isBlank()
                || props.secretKey() == null || props.secretKey().isBlank()
                || props.bucket() == null || props.bucket().isBlank()) {
            throw new IllegalStateException(
                    "Cloudflare R2 is not configured: set R2_ENDPOINT, R2_ACCESS_KEY, "
                            + "R2_SECRET_KEY, and R2_BUCKET before starting the application");
        }
        String endpoint = props.endpoint().replaceAll("/+$", "");
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(props.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(props.accessKey(), props.secretKey())))
                .forcePathStyle(true)
                .build();
    }
}
