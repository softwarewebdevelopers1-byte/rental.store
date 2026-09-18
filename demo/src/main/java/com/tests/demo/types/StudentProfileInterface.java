package com.tests.demo.types;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tests.demo.models.StudentProfile;

public interface StudentProfileInterface extends JpaRepository<StudentProfile, Long> {

}
