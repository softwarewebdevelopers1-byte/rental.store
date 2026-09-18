package com.pata.keja.repository;

import com.pata.keja.models.Conversation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<Conversation, String> {

    @EntityGraph(attributePaths = { "participants", "participants.user" })
    @Query("""
                select distinct c from Conversation c
                join c.participants p
                where p.user.id = :userId
                order by c.lastMessageAt desc nulls last
            """)
    List<Conversation> findAllForUser(@Param("userId") String userId);

    @EntityGraph(attributePaths = { "participants", "participants.user" })
    @Query("select c from Conversation c where c.id = :id")
    Optional<Conversation> findByIdWithParticipants(@Param("id") String id);

    /**
     * Finds an existing conversation between a set of participants.
     * Simpler than a proper "all participants must match" query but works for
     * the common 2-person case (used by "message landlord" button).
     */
    @Query("""
                select c from Conversation c
                join c.participants p
                where p.user.id in :userIds
                group by c
                having count(distinct p.user.id) = :count
            """)
    List<Conversation> findByParticipants(
            @Param("userIds") List<String> userIds,
            @Param("count") long count);
}
