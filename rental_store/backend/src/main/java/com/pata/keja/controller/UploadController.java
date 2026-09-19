package com.pata.keja.controller;

import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pata.keja.dto.upload.UploadResponse;
import com.pata.keja.exception.ConflictException;
import com.pata.keja.service.StorageService;

/**
 * Single upload endpoint that forwards files to Cloudflare R2 and returns
 * the resulting public URL. The URL is then stored by the relevant entity
 * service through its existing create/update DTOs.
 */
@RestController
@RequestMapping("/api/uploads")
@PreAuthorize("isAuthenticated()")
public class UploadController {

    static final Set<String> ALLOWED_FOLDERS = Set.of(
            "hostels", "products", "packs", "avatars", "maintenance", "messages", "conflicts");

    private final StorageService storageService;

    public UploadController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String folder) {

        if (file.isEmpty()) {
            throw new ConflictException("File is required");
        }

        String resolvedFolder = folder == null || folder.isBlank() ? "misc" : folder;
        if (!ALLOWED_FOLDERS.contains(resolvedFolder)) {
            throw new ConflictException("Invalid folder: " + resolvedFolder);
        }

        String url;
        try {
            url = storageService.upload(
                    resolvedFolder,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes());
        } catch (java.io.IOException e) {
            throw new ConflictException("Unable to read uploaded file");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(new UploadResponse(url));
    }
}
