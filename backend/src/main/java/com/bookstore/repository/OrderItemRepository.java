package com.bookstore.repository;

import com.bookstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    /*
    // Tìm order items theo order ID
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);
    
    // Tìm order items theo book ID
    @Query("SELECT oi FROM OrderItem oi WHERE oi.book.id = :bookId")
    List<OrderItem> findByBookId(@Param("bookId") Long bookId);
    */
    
    // Thống kê sách bán chạy nhất
    @Query("SELECT oi.book.id, oi.book.title, SUM(oi.quantity) as totalSold " +
           "FROM OrderItem oi " +
           "GROUP BY oi.book.id, oi.book.title " +
           "ORDER BY totalSold DESC")
    List<Object[]> findBestSellingBooks();
    
    // Tổng số lượng sách đã bán theo book ID
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.book.id = :bookId")
    Long getTotalQuantitySoldByBook(@Param("bookId") Long bookId);
} 