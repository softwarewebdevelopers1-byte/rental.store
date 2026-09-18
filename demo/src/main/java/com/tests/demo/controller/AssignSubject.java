package com.tests.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tests.demo.DTO.SubjectDTO;
import com.tests.demo.models.Subjects;
import com.tests.demo.types.SubjectsInterface;

@RestController
public class AssignSubject {
    private SubjectsInterface subjectsInterface;

    public AssignSubject(SubjectsInterface subjectsInterface) {
        this.subjectsInterface = subjectsInterface;
    }

    @PostMapping("/create/subject")
    private Subjects AssignSubjects(@RequestBody SubjectDTO subjectDTO) {
        var savedSubject = toSubjects(subjectDTO);
        subjectsInterface.save(savedSubject);
        return savedSubject;
    }

    private Subjects toSubjects(SubjectDTO subjectDto) {
        var subjects = new Subjects();
        subjects.setSubjectName(subjectDto.subjectName());
        return subjects;
    }
}
