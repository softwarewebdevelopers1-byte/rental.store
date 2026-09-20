package com.pata.keja.messaging;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Component
public class MessageEventBus {

    private static final long EMITTER_TIMEOUT_MILLIS = 30 * 60 * 1000L;

    private final ConcurrentHashMap<String, CopyOnWriteArrayList<SseEmitter>> emitters =
            new ConcurrentHashMap<>();

    public SseEmitter subscribe(String userId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MILLIS);
        CopyOnWriteArrayList<SseEmitter> userEmitters =
                emitters.computeIfAbsent(userId, ignored -> new CopyOnWriteArrayList<>());
        userEmitters.add(emitter);

        Runnable remove = () -> remove(userId, emitter);
        emitter.onCompletion(remove);
        emitter.onTimeout(remove);
        emitter.onError(ignored -> remove.run());
        return emitter;
    }

    public void publish(String userId, Object payload) {
        CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null) {
            return;
        }

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(payload);
            } catch (IOException | IllegalStateException exception) {
                remove(userId, emitter);
            }
        }
    }

    public void complete(String userId) {
        CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.remove(userId);
        if (userEmitters == null) {
            return;
        }
        userEmitters.forEach(SseEmitter::complete);
    }

    private void remove(String userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null) {
            return;
        }
        userEmitters.remove(emitter);
        if (userEmitters.isEmpty()) {
            emitters.remove(userId, userEmitters);
        }
    }
}
