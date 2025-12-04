package com.pvn.dacn.controller;

import com.pvn.dacn.dto.UserCreateDTO;
import com.pvn.dacn.dto.UserUpdateDTO;
import com.pvn.dacn.entity.User;
import com.pvn.dacn.repository.UserRepository;
import com.pvn.dacn.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
@CrossOrigin(origins = "*")
@RestController
public class UserController {
    @Autowired
    private UserService userService;

    @PostMapping("/users")
    ResponseEntity<?> createUser(@RequestBody UserCreateDTO request){
        try {
            User newUser = userService.createRequest(request);
            return ResponseEntity.ok(newUser);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Tên đăng nhập đã tồn tại")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Collections.singletonMap("message", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/users/details")
    User getUserDetailsByUsername(@RequestParam String username) {
        return userService.getUserByUsername(username);
    }

    @GetMapping("/users")
    List<User> getUsers(){
        return userService.getUsers();
    }

    @GetMapping("/users/{id}")
    User getUser(@PathVariable String id){
        return userService.getUser(id);
    }

    @PutMapping("/users/{id}")
    User updateUser(@PathVariable String id, @RequestBody UserUpdateDTO request){
        return userService.updateUser(id, request);
    }
    @DeleteMapping("/users/{id}")
    public void delUser(@PathVariable String id){
        userService.delUser(id);
    }
}
