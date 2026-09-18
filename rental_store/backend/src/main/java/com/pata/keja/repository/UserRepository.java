package com.pata.keja.repository;

import com.pata.keja.enums.UserRoles;
import com.pata.keja.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByRole(UserRoles role);

    /**
     * Type-safe "is this user of type X" check.
     * Works because Hibernate resolves the JOINED subclass.
     */
    @Query("select u from User u where u.id = :id and type(u) = :type")
    <T extends User> Optional<T> findByIdAndType(@Param("id") String id,
            @Param("type") Class<T> type);
}
