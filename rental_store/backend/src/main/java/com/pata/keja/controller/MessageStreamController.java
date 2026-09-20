package com.pata.keja.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import com.pata.keja.messaging.MessageEventBus;
import com.pata.keja.security.JwtService;

import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/messages")
public class MessageStreamController {

    private final JwtService jwtService;
    private final MessageEventBus messageEventBus;

    public MessageStreamController(JwtService jwtService, MessageEventBus messageEventBus) {
        this.jwtService = jwtService;
        this.messageEventBus = messageEventBus;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> stream(@RequestParam String token) {
        try {
            Claims claims = jwtService.parse(token);
            String userId = claims.get("userId", String.class);
            if (userId == null || userId.isBlank()) {
                return ResponseEntity.status(401).build();
            }

            SseEmitter emitter = messageEventBus.subscribe(userId);
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .cacheControl(CacheControl.noCache())
                    .body(emitter);
        } catch (JwtException | IllegalArgumentException exception) {
            return ResponseEntity.status(401).build();
        }
    }
}
