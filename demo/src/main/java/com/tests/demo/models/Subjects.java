package com.tests.demo.models;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "students_subjects")
public class Subjects {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @Column(name = "subjects_name")
    String SubjectName;
    // creating relationship between students and subjects
    @ManyToMany
    List<Student> student;

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getId() {
        return this.id;
    }

    public void setSubjectName(String subjectName) {
        this.SubjectName = subjectName;
    }

    public String getSubjectName() {
        return this.SubjectName;
    }

    public void setStudent(List<Student> student) {
        this.student = student;
    }

    public List<Student> getStudent() {
        return this.student;
    }

    public Subjects() {
    }

    public Subjects(String subjectName) {
        this.SubjectName = subjectName;
    }
}
