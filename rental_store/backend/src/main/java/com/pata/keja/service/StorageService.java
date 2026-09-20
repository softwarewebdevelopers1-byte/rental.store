package com.pata.keja.service;

/**
 * Stores and deletes uploaded files in Cloudflare R2.
 *
 * <p>Implementations return a publicly-fetchable URL (either a stable
 * bucket URL or a short-lived presigned URL) so that callers can persist
 * the URL directly in entity columns.</p>
 */
public interface StorageService {

    /**
     * Uploads the given content and returns the URL to store in the DB.
     *
     * @param folder       logical folder (e.g. "hostels", "products")
     * @param originalName the client-provided filename (used for the extension only)
     * @param contentType  MIME type from the upload
     * @param content      the file bytes
     * @return the URL clients should use to fetch the file
     */
    String upload(String folder, String originalName, String contentType, byte[] content);

    /**
     * Deletes the object behind a previously returned URL.
     * Best-effort: does not throw if the object is already gone.
     */
    void delete(String url);

    /**
     * Returns whether the URL belongs to this configured R2 bucket/public origin.
     */
    boolean ownsUrl(String url);
}
