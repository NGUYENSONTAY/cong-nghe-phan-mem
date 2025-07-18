package com.bookstore.controller;

import com.bookstore.dto.OrderDTO;
import com.bookstore.dto.OrderSummaryDTO;
import com.bookstore.dto.OrderItemSummaryDTO;
import com.bookstore.entity.Order;
import com.bookstore.entity.OrderItem;
import com.bookstore.entity.OrderStatus;
import com.bookstore.service.AuthService;
import com.bookstore.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AuthService authService;

    // Tạo đơn hàng mới (customer)
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        try {
            Long userId = authService.getCurrentUser().getId();
            Order order = orderService.createOrder(userId, orderDTO);
            OrderSummaryDTO dto = OrderSummaryDTO.fromOrderWithDetails(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create order");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Lấy đơn hàng theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        try {
            Order order = orderService.getOrderByIdWithDetails(id);
            Long userId = authService.getCurrentUser().getId();
            
            // Kiểm tra quyền truy cập (customer chỉ xem đơn hàng của mình)
            if (authService.getCurrentUser().getRole().name().equals("CUSTOMER") && 
                !orderService.canUserAccessOrder(userId, id)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied");
                error.put("message", "Bạn không có quyền xem đơn hàng này");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            OrderSummaryDTO dto = OrderSummaryDTO.fromOrderWithDetails(order);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Order not found");
            error.put("message", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Lấy đơn hàng của user hiện tại
    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Long userId = authService.getCurrentUser().getId();
            Page<Order> ordersPage = orderService.getOrdersByUserWithEagerLoading(userId, page, size);
            
            List<OrderSummaryDTO> orderDTOs = ordersPage.getContent().stream()
                .map(OrderSummaryDTO::fromOrderWithDetails)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", orderDTOs);
            response.put("totalElements", ordersPage.getTotalElements());
            response.put("totalPages", ordersPage.getTotalPages());
            response.put("number", ordersPage.getNumber());
            response.put("size", ordersPage.getSize());
            response.put("first", ordersPage.isFirst());
            response.put("last", ordersPage.isLast());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get orders");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /*
    // Helper method to convert Order to OrderResponseDTO
    private OrderResponseDTO convertToOrderResponseDTO(Order order) {
        List<OrderItemDTO> orderItemDTOs = order.getOrderItems().stream()
                .map(this::convertToOrderItemDTO)
                .collect(Collectors.toList());
        
        return new OrderResponseDTO(
                order.getId(),
                order.getUser().getId(),
                order.getUser().getFullName(),
                order.getUser().getEmail(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getShippingAddress(),
                order.getPaymentMethod(),
                order.getOrderDate(),
                orderItemDTOs
        );
    }
    
    // Helper method to convert OrderItem to OrderItemDTO
    private OrderItemDTO convertToOrderItemDTO(OrderItem orderItem) {
        return new OrderItemDTO(
                orderItem.getId(),
                orderItem.getBook() != null ? orderItem.getBook().getId() : null,
                orderItem.getBook() != null ? orderItem.getBook().getTitle() : null,
                orderItem.getBook() != null && orderItem.getBook().getAuthor() != null ? 
                    orderItem.getBook().getAuthor().getName() : null,
                orderItem.getBook() != null ? orderItem.getBook().getImageUrl() : null,
                orderItem.getQuantity(),
                orderItem.getPrice()
        );
    }
    */

    // Hủy đơn hàng (customer)
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        try {
            Long userId = authService.getCurrentUser().getId();
            Order order = orderService.cancelOrder(id, userId);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to cancel order");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // === ADMIN ENDPOINTS ===

    // Lấy tất cả đơn hàng (admin)
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Order> ordersPage = orderService.getAllOrdersWithDetails(page, size);
            
            List<OrderSummaryDTO> orderDTOs = ordersPage.getContent().stream()
                .map(OrderSummaryDTO::fromOrderWithDetails)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", orderDTOs);
            response.put("totalElements", ordersPage.getTotalElements());
            response.put("totalPages", ordersPage.getTotalPages());
            response.put("number", ordersPage.getNumber());
            response.put("size", ordersPage.getSize());
            response.put("first", ordersPage.isFirst());
            response.put("last", ordersPage.isLast());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get orders");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Lấy đơn hàng theo trạng thái (admin)
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrdersByStatus(
            @PathVariable OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Page<Order> ordersPage = orderService.getOrdersByStatusWithDetails(status, page, size);
            
            List<OrderSummaryDTO> orderDTOs = ordersPage.getContent().stream()
                .map(OrderSummaryDTO::fromOrderWithDetails)
                .collect(Collectors.toList());
                
            Map<String, Object> response = new HashMap<>();
            response.put("content", orderDTOs);
            response.put("totalElements", ordersPage.getTotalElements());
            response.put("totalPages", ordersPage.getTotalPages());
            response.put("number", ordersPage.getNumber());
            response.put("size", ordersPage.getSize());
            response.put("first", ordersPage.isFirst());
            response.put("last", ordersPage.isLast());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get orders by status");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Cập nhật trạng thái đơn hàng (admin)
    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        try {
            Order order = orderService.updateOrderStatus(id, status);
            OrderSummaryDTO dto = OrderSummaryDTO.fromOrderWithDetails(order);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update order status");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Xác nhận đơn hàng (admin)
    @PatchMapping("/admin/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> confirmOrder(@PathVariable Long id) {
        try {
            Order order = orderService.confirmOrder(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to confirm order");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Đánh dấu đã giao hàng (admin)
    @PatchMapping("/admin/{id}/ship")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> markAsShipped(@PathVariable Long id) {
        try {
            Order order = orderService.markAsShipped(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to mark as shipped");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Đánh dấu đã nhận hàng (admin)
    @PatchMapping("/admin/{id}/deliver")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> markAsDelivered(@PathVariable Long id) {
        try {
            Order order = orderService.markAsDelivered(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to mark as delivered");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thống kê đơn hàng (admin)
    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getOrderStatistics() {
        try {
            OrderService.OrderStatistics stats = orderService.getOrderStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Doanh thu theo thời gian (admin)
    @GetMapping("/admin/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getRevenue(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        try {
            Map<String, Object> revenue = new HashMap<>();
            
            if (startDate != null && endDate != null) {
                LocalDateTime start = LocalDateTime.parse(startDate);
                LocalDateTime end = LocalDateTime.parse(endDate);
                BigDecimal periodRevenue = orderService.getTotalRevenueByPeriod(start, end);
                revenue.put("periodRevenue", periodRevenue);
                revenue.put("startDate", startDate);
                revenue.put("endDate", endDate);
            } else {
                BigDecimal totalRevenue = orderService.getTotalRevenue();
                revenue.put("totalRevenue", totalRevenue);
            }
            
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get revenue");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Thống kê theo tháng (admin)
    @GetMapping("/admin/monthly-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMonthlyStats() {
        try {
            List<Object[]> stats = orderService.getMonthlyStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get monthly stats");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Đơn hàng lớn nhất (admin)
    @GetMapping("/admin/largest-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getLargestOrders() {
        try {
            List<Order> orders = orderService.getLargestOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get largest orders");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 