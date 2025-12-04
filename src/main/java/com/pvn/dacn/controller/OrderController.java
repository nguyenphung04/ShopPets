package com.pvn.dacn.controller;

import com.pvn.dacn.dto.OrderRequestDTO;
import com.pvn.dacn.entity.Order;
import com.pvn.dacn.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO request) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            Order newOrder = orderService.createOrder(request, username);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Đặt hàng thành công");
            response.put("orderId", newOrder.getId());
            response.put("totalAmount", newOrder.getTotalAmount());
            if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
                String paymentUrl = orderService.createVnpayPaymentUrl(newOrder);
                response.put("paymentUrl", paymentUrl);
            }
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi hệ thống khi tạo đơn hàng."));
        }
    }
}