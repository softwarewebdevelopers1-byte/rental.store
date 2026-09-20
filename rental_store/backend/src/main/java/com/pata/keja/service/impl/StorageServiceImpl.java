package com.pata.keja.service.impl;

import java.net.URI;
import java.time.YearMonth;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.pata.keja.config.StorageProperties;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.service.StorageService;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

/**
 * R2 (S3-compatible) storage implementation.
 *
 * <p>When {@code publicBaseUrl} is configured the service returns a stable
 * public URL. Otherwise it falls back to a presigned GET URL that expires in
 * 7 days — production deployments should always set {@code publicBaseUrl}.</p>
 */
@Service
public class StorageServiceImpl implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(StorageServiceImpl.class);

    static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf");

    static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024L;

    private final S3Client s3Client;
    private final StorageProperties props;

    public StorageServiceImpl(S3Client s3Client, StorageProperties props) {
        this.s3Client = s3Client;
        this.props = props;
    }

    @Override
    public String upload(String folder, String originalName, String contentType, byte[] content) {
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new ConflictException("Unsupported file type");
        }
        if (content == null || content.length > MAX_FILE_SIZE_BYTES) {
            throw new ConflictException("File too large");
        }

        String ext = extractExtension(originalName, contentType);
        YearMonth month = YearMonth.now();
        String key = String.format("%s/%d/%02d/%s.%s",
                folder, month.getYear(), month.getMonth().getValue(), UUID.randomUUID(), ext);

        var put = PutObjectRequest.builder()
                .bucket(props.bucket())
                .key(key)
                .contentType(contentType)
                .cacheControl("public, max-age=31536000, immutable")
                .build();

        try {
            s3Client.putObject(put, RequestBody.fromBytes(content));
        } catch (S3Exception exception) {
            if (exception.statusCode() == 403) {
                throw new ConflictException(
                        "Cloudflare R2 denied the upload. Verify that R2_ACCESS_KEY and "
                                + "R2_SECRET_KEY belong to an API token with Object Read & Write "
                                + "access to bucket '" + props.bucket() + "'.");
            }
            throw new ConflictException("Cloudflare R2 upload failed: " + exception.awsErrorDetails().errorMessage());
        }

        return buildPublicUrl(key);
    }

    @Override
    public void delete(String url) {
        if (url == null || url.isBlank()) {
            return;
        }
        String key = extractKey(url);
        if (key == null || key.isBlank()) {
            return;
        }
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(props.bucket())
                    .key(key)
                    .build());
        } catch (S3Exception e) {
            log.warn("Failed to delete R2 object for URL (ignored): {}", url, e);
        }
    }

    @Override
    public boolean ownsUrl(String url) {
        return extractKey(url) != null;
    }

    private String buildPublicUrl(String key) {
        String base = props.publicBaseUrl();
        if (base != null && !base.isBlank()) {
            return base.replaceAll("/+$", "") + "/" + key;
        }
        return presignGet(key);
    }

    private String presignGet(String key) {
        try (S3Presigner presigner = S3Presigner.builder()
                .endpointOverride(URI.create(props.endpoint()))
                .region(Region.of(props.region()))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(props.accessKey(), props.secretKey())))
                .build()) {
            GetObjectRequest getRequest = GetObjectRequest.builder()
                    .bucket(props.bucket())
                    .key(key)
                    .build();
            PresignedGetObjectRequest presigned = presigner.presignGetObject(b -> b
                    .getObjectRequest(getRequest)
                    .signatureDuration(java.time.Duration.ofDays(7)));
            return presigned.url().toString();
        }
    }

    private String extractKey(String url) {
        String base = props.publicBaseUrl();
        if (base != null && !base.isBlank() && url.startsWith(base)) {
            String path = url.substring(base.length());
            if (path.startsWith("/")) path = path.substring(1);
            int q = path.indexOf('?');
            if (q >= 0) path = path.substring(0, q);
            return path.isBlank() ? null : path;
        }
        try {
            URI uri = URI.create(url);
            URI endpoint = URI.create(props.endpoint());
            if (!endpoint.getHost().equalsIgnoreCase(uri.getHost())) {
                return null;
            }
            String path = uri.getPath();
            if (path.startsWith("/")) path = path.substring(1);
            String bucketPrefix = props.bucket() + "/";
            if (path.startsWith(bucketPrefix)) {
                path = path.substring(bucketPrefix.length());
            }
            return path.isBlank() ? null : path;
        } catch (Exception e) {
            return null;
        }
    }

    private static String extractExtension(String originalName, String contentType) {
        String ext = "";
        if (originalName != null && originalName.contains(".")) {
            int lastDot = originalName.lastIndexOf('.');
            ext = originalName.substring(lastDot + 1).toLowerCase(Locale.ROOT);
        }
        if (ext.isEmpty()) {
            ext = contentTypeToExt(contentType);
        }
        ext = ext.replaceAll("[^a-z0-9]", "");
        if (ext.isEmpty()) {
            ext = "bin";
        }
        if (ext.length() > 5) {
            ext = ext.substring(0, 5);
        }
        return ext;
    }

    private static String contentTypeToExt(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            case "application/pdf" -> "pdf";
            default -> "bin";
        };
    }
}
