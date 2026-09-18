package com.tests.demo.models;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
public class School {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;
    @JsonProperty("school")
    String schoolName;

    // create relationship school--> students
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL)
    private List<Student> students;

    public School() {
    }

    public School(String name) {
        this.schoolName = name;
    }

    public void setStudents(List<Student> students) {
        this.students = students;
    }

    public List<Student> getStudents() {
        return students;
    }

    public void setSchoolName(String name) {
        this.schoolName = name;
    }

    public String getSchoolName() {
        return this.schoolName;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return id;
    }
}
