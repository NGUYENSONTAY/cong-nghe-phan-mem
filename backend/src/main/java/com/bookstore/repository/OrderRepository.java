package com.bookstore.repository;

import com.bookstore.entity.Order;
import com.bookstore.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Tìm đơn hàng theo user ID
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
    
    // Tìm đơn hàng theo user ID với pagination
    Page<Order> findByUserIdOrderByOrderDateDesc(Long userId, Pageable pageable);
    
    // Tìm đơn hàng theo user ID với JOIN FETCH (eager loading)
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.user u " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.book b " +
           "LEFT JOIN FETCH b.author " +
           "WHERE u.id = :userId " +
           "ORDER BY o.orderDate DESC")
    List<Order> findByUserIdWithOrderItemsAndBooks(@Param("userId") Long userId);
    
    // Tìm đơn hàng theo trạng thái
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    // Đếm số đơn hàng theo trạng thái
    long countByStatus(OrderStatus status);
    
    // Tìm đơn hàng trong khoảng thời gian
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate")
    List<Order> findOrdersBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    // Tính tổng doanh thu theo trạng thái
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    BigDecimal getTotalRevenueByStatus(@Param("status") OrderStatus status);
    
    // Tính tổng doanh thu trong khoảng thời gian
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.status = :status")
    BigDecimal getTotalRevenueBetweenDates(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate,
                                          @Param("status") OrderStatus status);
    
    // Thống kê theo tháng
    @Query("SELECT MONTH(o.orderDate), YEAR(o.orderDate), COUNT(o), SUM(o.totalAmount) FROM Order o WHERE o.status = :status GROUP BY YEAR(o.orderDate), MONTH(o.orderDate) ORDER BY YEAR(o.orderDate), MONTH(o.orderDate)")
    List<Object[]> getMonthlyOrderStats(@Param("status") OrderStatus status);
    
    // ===== NEW METHODS WITH JOIN FETCH để tránh lazy loading =====
    
    // Lấy tất cả orders với JOIN FETCH user và order items
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.book b " +
           "LEFT JOIN FETCH b.author " +
           "ORDER BY o.orderDate DESC")
    Page<Order> findAllWithUserAndOrderItems(Pageable pageable);
    
    // Lấy orders theo trạng thái với JOIN FETCH
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.book b " +
           "LEFT JOIN FETCH b.author " +
           "WHERE o.status = :status " +
           "ORDER BY o.orderDate DESC")
    Page<Order> findByStatusWithUserAndOrderItems(@Param("status") OrderStatus status, Pageable pageable);
    
    // Lấy order theo ID với JOIN FETCH
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.user " +
           "LEFT JOIN FETCH o.orderItems oi " +
           "LEFT JOIN FETCH oi.book b " +
           "LEFT JOIN FETCH b.author " +
           "WHERE o.id = :id")
    Optional<Order> findByIdWithUserAndOrderItems(@Param("id") Long id);
} 