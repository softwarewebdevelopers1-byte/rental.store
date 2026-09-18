package com.tests.demo.types;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tests.demo.models.Student;

public interface StudentsInterface extends JpaRepository<Student, Long> {
    List<Student> findAllByFullNameContaining(String FullName);

    boolean existsByAdm(Long adm);
}
