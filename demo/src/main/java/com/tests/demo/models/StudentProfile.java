package com.tests.demo.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "student_profile")
public class StudentProfile {
    @Id
    Long id;

    @Column(name = "bio")
    String bio;

    // creating relationsip linking students with students profile
    @OneToOne
    @JoinColumn(name = "student_id")
    // the student variable here is refferenced by one to one mapping in student
    // class
    private Student student;

    public StudentProfile() {
    }

    public StudentProfile(String bio) {
        this.bio = bio;
    }
}
