package com.pvn.dacn.repository;

import com.pvn.dacn.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    List<User> findByStatusNot(int status);
    Optional<User> findByUsername(String username);
}
