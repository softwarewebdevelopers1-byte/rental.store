package com.tests.demo.controller;

import org.springframework.web.bind.annotation.RestController;

import com.tests.demo.DTO.SubjectDTO;
import com.tests.demo.models.Subjects;
import com.tests.demo.types.SubjectsInterface;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class GetSubjects {
    private SubjectsInterface subjectsInterface;

    public GetSubjects(SubjectsInterface subjectsInterface) {
        this.subjectsInterface = subjectsInterface;
    }

    @GetMapping("/subjects/{userId}")
    public String subjects(@PathVariable("userId") String userId) {
        return userId;
    }

    // http://localhost:8000/subjects?subjectId=english&userId=2
    @GetMapping("/subjects")
    public List<SubjectDTO> getSubjectName() {
        List<Subjects> subjects = subjectsInterface.findAll();
        return toSubjects(subjects);
    }

    private List<SubjectDTO> toSubjects(List<Subjects> subjects) {
        return subjects.stream().map(subject -> new SubjectDTO(subject.getSubjectName())).toList();
    }

}
