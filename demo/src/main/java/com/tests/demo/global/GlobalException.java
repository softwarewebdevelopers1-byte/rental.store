package com.tests.demo.global;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.tests.demo.error.DuplicateStudent;
import com.tests.demo.error.SchoolNotFoundException;

@RestControllerAdvice
public class GlobalException {
    // exception handler that validates if school exists
    @ExceptionHandler(SchoolNotFoundException.class)
    public ResponseEntity<?> SchoolNotFound(SchoolNotFoundException exception) {
        return ResponseEntity.status(404).body(exception.getMessage());
    }

    // exception handler that validates if there is duplicate adm
    @ExceptionHandler(DuplicateStudent.class)
    public final ResponseEntity<?> DuplicateStudentHandler(DuplicateStudent duplicateStudent) {
        return ResponseEntity.status(409).body(duplicateStudent.getMessage());
    }
}
