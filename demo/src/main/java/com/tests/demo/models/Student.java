package com.tests.demo.models;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

// creating jpa data persistency class 
@Entity
@Table(name = "students")
public class Student {
    // id to be generated in the database
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "admission", unique = true)
    Long adm;
    // creating relationship between student and subjects (One to Many)
    @ManyToMany(mappedBy = "student")
    List<Subjects> Subjects;
    // creating relationship between student and student profile
    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL)
    private StudentProfile profile;
    // create a relationship between students and school
    @ManyToOne
    @JoinColumn(name = "school_id")
    private School school;

    public Student() {
    }

    public Student(String fullName, Long Adm) {
        this.fullName = fullName;
        this.adm = Adm;
    }

    public void setAdm(Long adm) {
        this.adm = adm;
    }

    public Long getAdm() {
        return this.adm;
    }

    public void setFullName(String name) {
        this.fullName = name;
    }

    public String getFullName() {
        return this.fullName;
    }

    public void setSchool(School name) {
        this.school = name;
    }

    public School getSchool() {
        return school;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }

}
