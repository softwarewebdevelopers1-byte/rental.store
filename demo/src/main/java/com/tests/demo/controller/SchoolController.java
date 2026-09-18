package com.tests.demo.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.tests.demo.DTO.SchoolDTO;
import com.tests.demo.models.School;
import com.tests.demo.types.SchoolInterface;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class SchoolController {
    SchoolInterface schoolInterface;

    public SchoolController(SchoolInterface schoolInterface) {
        this.schoolInterface = schoolInterface;
    }

    @PostMapping("/schools")
    public SchoolDTO CreateSchool(@RequestBody SchoolDTO schoolDTO) {
        var school = toSchool(schoolDTO);
        schoolInterface.save(school);
        return schoolDTO;
    }

    private School toSchool(SchoolDTO dto) {
        var school = new School();
        school.setSchoolName(dto.schoolName());
        return school;
    }

    @GetMapping("/schools")
    public List<SchoolDTO> getMethodName() {
        return schoolInterface.findAll().stream().map(school -> new SchoolDTO(school.getSchoolName())).toList();
    }

}
