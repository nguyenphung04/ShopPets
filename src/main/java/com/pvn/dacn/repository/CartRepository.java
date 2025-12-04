package com.pvn.dacn.repository;

import com.pvn.dacn.entity.Cart;
import com.pvn.dacn.entity.Pet;
import com.pvn.dacn.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String> {
    List<Cart> findByUser(User user);
    Optional<Cart> findByUserAndPet(User user, Pet pet);
    void deleteByUser(User user);
}