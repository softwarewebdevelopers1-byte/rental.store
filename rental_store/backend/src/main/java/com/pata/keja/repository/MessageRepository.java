package com.pata.keja.repository;

import com.pata.keja.models.Message;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, String> {

    @EntityGraph(attributePaths = { "sender", "conversation" })
    @Query("""
                select m from Message m
                where m.conversation.id = :conversationId
                order by m.createdAt asc
            """)
    List<Message> findAllByConversation(@Param("conversationId") String conversationId);

    @EntityGraph(attributePaths = { "sender" })
    @Query("""
                select m from Message m
                where m.conversation.id = :conversationId
                  and m.createdAt > :since
                order by m.createdAt asc
            """)
    List<Message> findSince(@Param("conversationId") String conversationId,
            @Param("since") Instant since);

    long countByConversationIdAndCreatedAtAfter(String conversationId, Instant since);
}
