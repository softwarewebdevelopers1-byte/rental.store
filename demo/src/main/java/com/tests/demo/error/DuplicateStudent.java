package com.tests.demo.error;

public class DuplicateStudent extends RuntimeException {
    public DuplicateStudent(String message) {
        super(message);
    }
}
