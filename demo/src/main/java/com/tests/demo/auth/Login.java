package com.tests.demo.auth;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;

// For sending rest response
@RestController
public class Login {
    private String message;

    // constructor injection
    public Login() {
    }

    // setter method
    public void setMessage(String info) {
        this.message = info;
    }

    // annotation for performing post operations
    @PostMapping("/login")
    // response status annotation
    @ResponseStatus(HttpStatus.OK)
    // method for performing the post operation
    public String LoginUser() {
        this.setMessage("logged in");
        return message;
    }
}
