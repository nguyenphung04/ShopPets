package com.pvn.dacn.service;

import com.pvn.dacn.dto.AddToCartDTO;
import com.pvn.dacn.dto.CartItemDTO;
import com.pvn.dacn.entity.Cart;
import com.pvn.dacn.entity.Pet;
import com.pvn.dacn.entity.User;
import com.pvn.dacn.repository.CartRepository;
import com.pvn.dacn.repository.PetRepository;
import com.pvn.dacn.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PetRepository petRepository;

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void addToCart(AddToCartDTO request) {
        User user = getCurrentUser();
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        Cart cartItem = cartRepository.findByUserAndPet(user, pet).orElse(null);

        if (cartItem != null) {
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = new Cart();
            cartItem.setUser(user);
            cartItem.setPet(pet);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setAddedAt(LocalDateTime.now());
        }

        cartRepository.save(cartItem);
    }

    public List<CartItemDTO> getMyCart() {
        User user = getCurrentUser();
        List<Cart> cartItems = cartRepository.findByUser(user);
        List<CartItemDTO> responses = new ArrayList<>();

        for (Cart item : cartItems) {
            CartItemDTO res = new CartItemDTO();
            res.setId(item.getId());
            res.setPetId(item.getPet().getId());
            res.setPetName(item.getPet().getName());
            res.setPetImage(item.getPet().getImg_url()); // Đảm bảo Entity Pet có getter này
            res.setPrice(item.getPet().getPrice());
            res.setQuantity(item.getQuantity());
            res.setSubTotal(item.getPet().getPrice() * item.getQuantity());
            responses.add(res);
        }
        return responses;
    }

    public void updateQuantity(String cartId, int quantity) {
        Cart cartItem = cartRepository.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartRepository.save(cartItem);
        }
    }

    public void removeCartItem(String cartId) {
        cartRepository.deleteById(cartId);
    }

    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        cartRepository.deleteByUser(user);
    }
}