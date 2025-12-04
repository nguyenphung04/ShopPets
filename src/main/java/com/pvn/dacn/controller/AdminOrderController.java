package com.pvn.dacn.controller;

import com.pvn.dacn.entity.Order;
import com.pvn.dacn.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/orders")
public class AdminOrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Cập nhật trạng thái đơn hàng (0: Chờ, 1: Đã thanh toán, 2: Giao, 3: Xong, 4: Hủy)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestParam int status) {
        try {
            orderService.updateOrderStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}