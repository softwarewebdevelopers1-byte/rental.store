package com.tests.demo.types;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tests.demo.models.Subjects;

public interface SubjectsInterface extends JpaRepository<Subjects, Integer> {

}
