package com.tests.demo.auth;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tests.demo.DTO.StudentDTO;
import com.tests.demo.error.DuplicateStudent;
import com.tests.demo.error.SchoolNotFoundException;
import com.tests.demo.models.School;
import com.tests.demo.models.Student;
import com.tests.demo.types.SchoolInterface;
import com.tests.demo.types.StudentsInterface;

import jakarta.validation.Valid;

@RestController
public class SignUp {
    private final StudentsInterface students;
    private final SchoolInterface schoolInterface;

    // constructor injection
    public SignUp(StudentsInterface studentsInterface, SchoolInterface schoolInterface) {
        this.students = studentsInterface;
        this.schoolInterface = schoolInterface;
    }

    @PostMapping("/create-account/student")
    public Student CreateAccount(
            @Valid @RequestBody StudentDTO dto) {
        Student studentDTO = toStudent(dto);
        return students.save(studentDTO);
    }

    private Student toStudent(@Valid StudentDTO dto) {
        var student = new Student();
        var school = new School();
        if (students.existsByAdm(dto.adm())) {
            throw new DuplicateStudent("Student with this admission already exists");
        }
        schoolInterface.findById(dto.school_id())
                .orElseThrow(() -> new SchoolNotFoundException("School not Found"));
        student.setFullName(dto.fullName());
        student.setAdm(dto.adm());
        school.setId(dto.school_id());
        // assign school object to student
        student.setSchool(school);
        return student;
    }
}
