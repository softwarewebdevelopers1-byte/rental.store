package com.pata.keja.repository;

import com.pata.keja.enums.UserRoles;
import com.pata.keja.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByRole(UserRoles role);

    long countByRole(UserRoles role);

    @Query("""
                select u from User u
                where (:q is null or lower(u.name) like lower(concat('%', :q, '%'))
                                  or lower(u.email) like lower(concat('%', :q, '%')))
                  and (:role is null or u.role = :role)
            """)
    Page<User> search(@Param("q") String q, @Param("role") UserRoles role, Pageable pageable);

    /**
     * Type-safe "is this user of type X" check.
     * Works because Hibernate resolves the JOINED subclass.
     */
    @Query("select u from User u where u.id = :id and type(u) = :type")
    <T extends User> Optional<T> findByIdAndType(@Param("id") String id,
            @Param("type") Class<T> type);
}
