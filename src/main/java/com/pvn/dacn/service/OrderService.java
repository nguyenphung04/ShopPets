package com.pvn.dacn.service;

import com.pvn.dacn.dto.OrderRequestDTO;
import com.pvn.dacn.entity.*;
import com.pvn.dacn.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VNPayService vnPayService;

    @Transactional
    public Order createOrder(OrderRequestDTO request, String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng."));

        List<Cart> cartItems = cartRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống, không thể đặt hàng.");
        }

        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDateTime.now());

        order.setStatus(0);

        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());

        order.setShippingAddress(request.getFullAddress());

        order.setNote(request.getNote());
        order.setPaymentMethod(request.getPaymentMethod());

        double totalAmount = 0;
        List<OrderDetail> orderDetails = new ArrayList<>();

        for (Cart cartItem : cartItems) {
            OrderDetail detail = new OrderDetail();
            detail.setOrder(order);
            detail.setPet(cartItem.getPet());
            detail.setQuantity(cartItem.getQuantity());
            detail.setPrice(cartItem.getPet().getPrice());

            // Tính tổng tiền
            totalAmount += (cartItem.getPet().getPrice() * cartItem.getQuantity());

            orderDetails.add(detail);
        }

        order.setTotalAmount(totalAmount);
        order.setOrderDetails(orderDetails);

        Order savedOrder = orderRepository.save(order);

        cartRepository.deleteByUser(user);

        return savedOrder;
    }

    public String createVnpayPaymentUrl(Order order) {
        try {
            return vnPayService.createPaymentUrl(
                    order.getId(), // <--- TRUYỀN ID ĐƠN HÀNG VÀO ĐÂY (Thay vì để Service tự random)
                    (long) order.getTotalAmount(),
                    "Thanh toan don hang " + order.getId(),
                    null
            );
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "orderDate"));
    }

    public void updateOrderStatus(String orderId, int status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        order.setStatus(status);
        orderRepository.save(order);
    }
}