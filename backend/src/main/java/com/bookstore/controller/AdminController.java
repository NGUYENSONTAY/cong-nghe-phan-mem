package com.bookstore.controller;

import com.bookstore.service.AuthorService;
import com.bookstore.service.BookService;
import com.bookstore.service.CategoryService;
import com.bookstore.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private BookService bookService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AuthorService authorService;

    @Autowired
    private OrderService orderService;

    // Dashboard tổng quan
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        try {
            Map<String, Object> dashboard = new HashMap<>();
            
            // Thống kê cơ bản
            dashboard.put("totalBooks", bookService.getTotalBooks());
            dashboard.put("availableBooks", bookService.getAvailableBooksCount());
            dashboard.put("totalCategories", categoryService.getTotalCategoriesCount());
            dashboard.put("totalAuthors", authorService.getTotalAuthors());
            
            // Thống kê đơn hàng
            OrderService.OrderStatistics orderStats = orderService.getOrderStatistics();
            dashboard.put("orderStatistics", orderStats);
            
            // Doanh thu
            dashboard.put("totalRevenue", orderService.getTotalRevenue());
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get dashboard data");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thống kê chi tiết sách
    @GetMapping("/books/statistics")
    public ResponseEntity<?> getBooksStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBooks", bookService.getTotalBooks());
            stats.put("availableBooks", bookService.getAvailableBooksCount());
            stats.put("outOfStockBooks", bookService.getTotalBooks() - bookService.getAvailableBooksCount());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get books statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thống kê chi tiết đơn hàng
    @GetMapping("/orders/statistics")
    public ResponseEntity<?> getOrdersStatistics() {
        try {
            OrderService.OrderStatistics stats = orderService.getOrderStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get orders statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thống kê doanh thu
    @GetMapping("/revenue/statistics")
    public ResponseEntity<?> getRevenueStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalRevenue", orderService.getTotalRevenue());
            stats.put("monthlyStats", orderService.getMonthlyStats());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get revenue statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thống kê tổng hợp
    @GetMapping("/overview")
    public ResponseEntity<?> getOverview() {
        try {
            Map<String, Object> overview = new HashMap<>();
            
            // Thống kê sách
            Map<String, Object> bookStats = new HashMap<>();
            bookStats.put("total", bookService.getTotalBooks());
            bookStats.put("available", bookService.getAvailableBooksCount());
            overview.put("books", bookStats);
            
            // Thống kê thể loại
            Map<String, Object> categoryStats = new HashMap<>();
            categoryStats.put("total", categoryService.getTotalCategoriesCount());
            overview.put("categories", categoryStats);
            
            // Thống kê tác giả
            Map<String, Object> authorStats = new HashMap<>();
            authorStats.put("total", authorService.getTotalAuthors());
            overview.put("authors", authorStats);
            
            // Thống kê đơn hàng
            OrderService.OrderStatistics orderStats = orderService.getOrderStatistics();
            Map<String, Object> orderOverview = new HashMap<>();
            orderOverview.put("total", orderStats.getTotalOrders());
            orderOverview.put("pending", orderStats.getPendingOrders());
            orderOverview.put("confirmed", orderStats.getConfirmedOrders());
            orderOverview.put("shipped", orderStats.getShippedOrders());
            orderOverview.put("delivered", orderStats.getDeliveredOrders());
            orderOverview.put("cancelled", orderStats.getCancelledOrders());
            overview.put("orders", orderOverview);
            
            // Doanh thu
            overview.put("totalRevenue", orderStats.getTotalRevenue());
            
            return ResponseEntity.ok(overview);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get overview");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Sách bán chạy nhất
    @GetMapping("/bestsellers")
    public ResponseEntity<?> getBestSellers(@RequestParam(defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(bookService.getBestSellingBooks(limit));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get bestsellers");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Đơn hàng lớn nhất
    @GetMapping("/largest-orders")
    public ResponseEntity<?> getLargestOrders() {
        try {
            return ResponseEntity.ok(orderService.getLargestOrders());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get largest orders");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 