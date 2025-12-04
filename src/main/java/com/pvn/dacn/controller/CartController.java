package com.pvn.dacn.controller;

import com.pvn.dacn.dto.AddToCartDTO;
import com.pvn.dacn.dto.CartItemDTO;
import com.pvn.dacn.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItemDTO>> getCart() {
        return ResponseEntity.ok(cartService.getMyCart());
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartDTO request) {
        cartService.addToCart(request);
        return ResponseEntity.ok(Map.of("message", "Thêm vào giỏ hàng thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuantity(@PathVariable String id, @RequestParam int quantity) {
        cartService.updateQuantity(id, quantity);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeItem(@PathVariable String id) {
        cartService.removeCartItem(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(Map.of("message", "Đã làm trống giỏ hàng"));
    }
}