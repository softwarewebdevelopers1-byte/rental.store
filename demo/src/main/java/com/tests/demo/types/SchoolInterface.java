package com.tests.demo.types;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tests.demo.models.School;

public interface SchoolInterface extends JpaRepository<School, Integer> {

}
