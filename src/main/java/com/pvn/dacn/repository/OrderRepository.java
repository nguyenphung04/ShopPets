package com.pvn.dacn.repository;

import com.pvn.dacn.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    @Query("SELECT MONTH(o.orderDate), SUM(o.totalAmount) FROM Order o WHERE (o.status = 1 OR o.status = 3) AND YEAR(o.orderDate) = YEAR(CURRENT_DATE) GROUP BY MONTH(o.orderDate)")
    List<Object[]> getMonthlyRevenue();
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> getOrderStatusCount();
}
