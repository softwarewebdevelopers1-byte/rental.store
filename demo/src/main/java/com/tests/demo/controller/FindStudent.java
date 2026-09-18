package com.tests.demo.controller;

import org.springframework.web.bind.annotation.RestController;

import com.tests.demo.DTO.StudentResponseDTO;
import com.tests.demo.models.Student;
import com.tests.demo.types.StudentsInterface;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class FindStudent {
    private final StudentsInterface student;

    public FindStudent(StudentsInterface studentsInterface) {
        this.student = studentsInterface;
    }

    // finding single student by id
    @GetMapping("/get/student/{id}")
    public StudentResponseDTO GetStudents(@PathVariable("id") Long id) {

        return toStudentResponse(student.findById(id).orElse(new Student()));
    }

    private StudentResponseDTO toStudentResponse(Student student) {
        return new StudentResponseDTO(student.getFullName(), student.getAdm());
    }

    // finding all students
    @GetMapping("/get/all/students")
    public List<StudentResponseDTO> GetAllStudents() {
        return student.findAll().stream().map(student -> new StudentResponseDTO(student.getFullName(), student.getId()))
                .toList();
    }

    // getting all students with a specific name
    @GetMapping("/get/all/students-fullname/{name}")
    public List<Student> GetStudentsByFullName(@PathVariable("name") String name) {
        return student.findAllByFullNameContaining(name);
    }

}
