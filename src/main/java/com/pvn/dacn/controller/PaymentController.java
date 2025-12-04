package com.pvn.dacn.controller;

import com.pvn.dacn.dto.PaymentDTO; // Tạo DTO này đơn giản chỉ chứa String status, message, url
import com.pvn.dacn.service.OrderService;
import com.pvn.dacn.service.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
public class PaymentController {

    @Autowired
    private VNPayService vnPayService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/create_payment")
    public ResponseEntity<?> createPayment(@RequestParam long amount, @RequestParam String orderInfo) throws Exception {
        String randomTxnRef = com.pvn.dacn.config.VNPayConfig.getRandomNumber(8);
        String paymentUrl = vnPayService.createPaymentUrl(randomTxnRef, amount, orderInfo, null);
        return ResponseEntity.ok(Map.of("url", paymentUrl));
    }

    @GetMapping("/vnpay_return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String orderId = request.getParameter("vnp_TxnRef");
        if ("00".equals(vnp_ResponseCode)) {
            try {
                orderService.updateOrderStatus(orderId, 1);
                System.out.println("Thanh toán thành công đơn hàng: " + orderId);
            } catch (Exception e) {
                System.err.println("Lỗi cập nhật trạng thái đơn hàng: " + e.getMessage());
            }
            response.sendRedirect("http://127.0.0.1:5501/success.html");
        } else {
            System.out.println("Thanh toán thất bại đơn hàng: " + orderId);
            response.sendRedirect("http://127.0.0.1:5501/failed.html");
        }
    }
}