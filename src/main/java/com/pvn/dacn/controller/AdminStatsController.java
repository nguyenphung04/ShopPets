package com.pvn.dacn.controller;

import com.pvn.dacn.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/admin/stats")
public class AdminStatsController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueStats() {
        List<Object[]> results = orderRepository.getMonthlyRevenue();

        Map<Integer, Double> revenueMap = new HashMap<>();
        for (int i = 1; i <= 12; i++) revenueMap.put(i, 0.0);

        for (Object[] row : results) {
            int month = (int) row[0];
            double amount = (double) row[1];
            revenueMap.put(month, amount);
        }
        List<Double> data = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            data.add(revenueMap.get(i));
        }

        return ResponseEntity.ok(data);
    }

    @GetMapping("/status")
    public ResponseEntity<?> getStatusStats() {
        List<Object[]> results = orderRepository.getOrderStatusCount();
        Map<Integer, Long> statusMap = new HashMap<>();
        for (Object[] row : results) {
            statusMap.put((Integer) row[0], (Long) row[1]);
        }
        return ResponseEntity.ok(statusMap);
    }
}