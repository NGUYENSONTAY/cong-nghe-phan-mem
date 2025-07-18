package com.bookstore.service;

import com.bookstore.dto.OrderDTO;
import com.bookstore.entity.*;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BookService bookService;
    
    // Tạo đơn hàng mới
    public Order createOrder(Long userId, OrderDTO orderDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + userId));
        
        // Tạo đơn hàng
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(orderDTO.getShippingAddress());
        order.setPaymentMethod(orderDTO.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        // Xử lý từng OrderItem
        for (OrderDTO.OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
            Book book = bookRepository.findById(itemDTO.getBookId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sách với ID: " + itemDTO.getBookId()));
            
            // Kiểm tra số lượng tồn kho
            if (!book.isAvailable(itemDTO.getQuantity())) {
                throw new RuntimeException("Sách '" + book.getTitle() + "' không đủ số lượng tồn kho");
            }
            
            // Tạo OrderItem
            OrderItem orderItem = new OrderItem();
            orderItem.setBook(book);
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setPrice(book.getPrice()); // Lưu giá tại thời điểm đặt hàng
            
            // Thêm vào đơn hàng
            order.addOrderItem(orderItem);
            
            // Tính tổng tiền
            totalAmount = totalAmount.add(orderItem.getSubtotal());
            
            // Giảm stock
            bookService.reduceStock(book.getId(), itemDTO.getQuantity());
        }
        
        order.setTotalAmount(totalAmount);
        
        return orderRepository.save(order);
    }
    
    // Lấy đơn hàng theo ID
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
    }
    
    // Lấy đơn hàng theo ID với JOIN FETCH để tránh lazy loading
    public Order getOrderByIdWithDetails(Long orderId) {
        return orderRepository.findByIdWithUserAndOrderItems(orderId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + orderId));
    }
    
    // Lấy đơn hàng của user
    public List<Order> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId);
    }
    
    // Lấy đơn hàng của user với pagination
    public Page<Order> getOrdersByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        return orderRepository.findByUserIdOrderByOrderDateDesc(userId, pageable);
    }
    
    // Lấy đơn hàng của user với eager loading (tránh lazy loading issues)
    public Page<Order> getOrdersByUserWithEagerLoading(Long userId, int page, int size) {
        // Lấy tất cả orders với JOIN FETCH
        List<Order> allOrders = orderRepository.findByUserIdWithOrderItemsAndBooks(userId);
        
        // Manual pagination
        int start = page * size;
        int end = Math.min(start + size, allOrders.size());
        
        if (start >= allOrders.size()) {
            return Page.empty();
        }
        
        List<Order> pageContent = allOrders.subList(start, end);
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, allOrders.size());
    }
    
    // Lấy tất cả đơn hàng (admin) với JOIN FETCH
    public Page<Order> getAllOrdersWithDetails(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        return orderRepository.findAllWithUserAndOrderItems(pageable);
    }
    
    // Lấy đơn hàng theo trạng thái với JOIN FETCH
    public Page<Order> getOrdersByStatusWithDetails(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        return orderRepository.findByStatusWithUserAndOrderItems(status, pageable);
    }
    
    // Lấy đơn hàng theo trạng thái
    public Page<Order> getOrdersByStatus(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        return orderRepository.findByStatus(status, pageable);
    }
    
    // Cập nhật trạng thái đơn hàng
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = getOrderById(orderId);
        
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        
        // Nếu hủy đơn hàng, hoàn lại stock
        if (newStatus == OrderStatus.CANCELLED && oldStatus != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getOrderItems()) {
                bookService.increaseStock(item.getBook().getId(), item.getQuantity());
            }
        }
        
        return orderRepository.save(order);
    }
    
    // Hủy đơn hàng
    public Order cancelOrder(Long orderId, Long userId) {
        Order order = getOrderById(orderId);
        
        // Kiểm tra quyền hủy đơn hàng
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }
        
        if (!order.canBeCancelled()) {
            throw new RuntimeException("Đơn hàng không thể hủy ở trạng thái hiện tại");
        }
        
        return updateOrderStatus(orderId, OrderStatus.CANCELLED);
    }
    
    // Xác nhận đơn hàng (admin)
    public Order confirmOrder(Long orderId) {
        return updateOrderStatus(orderId, OrderStatus.CONFIRMED);
    }
    
    // Cập nhật đơn hàng đã giao (admin)
    public Order markAsShipped(Long orderId) {
        return updateOrderStatus(orderId, OrderStatus.SHIPPED);
    }
    
    // Cập nhật đơn hàng đã nhận (admin)
    public Order markAsDelivered(Long orderId) {
        return updateOrderStatus(orderId, OrderStatus.DELIVERED);
    }
    
    // Lấy đơn hàng trong khoảng thời gian
    public List<Order> getOrdersBetweenDates(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findOrdersBetweenDates(startDate, endDate);
    }
    
    // Thống kê doanh thu
    public BigDecimal getTotalRevenue() {
        BigDecimal revenue = orderRepository.getTotalRevenueByStatus(OrderStatus.DELIVERED);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }
    
    public BigDecimal getTotalRevenueByPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal revenue = orderRepository.getTotalRevenueBetweenDates(startDate, endDate, OrderStatus.DELIVERED);
        return revenue != null ? revenue : BigDecimal.ZERO;
    }
    
    // Thống kê số lượng đơn hàng
    public long getTotalOrdersCount() {
        return orderRepository.count();
    }
    
    public long getPendingOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.PENDING);
    }
    
    public long getConfirmedOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.CONFIRMED);
    }
    
    public long getShippedOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.SHIPPED);
    }
    
    public long getDeliveredOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.DELIVERED);
    }
    
    public long getCancelledOrdersCount() {
        return orderRepository.countByStatus(OrderStatus.CANCELLED);
    }
    
    // Lấy đơn hàng lớn nhất
    public List<Order> getLargestOrders() {
        Pageable pageable = PageRequest.of(0, 10, Sort.by("totalAmount").descending());
        return orderRepository.findAll(pageable).getContent();
    }
    
    // Thống kê theo tháng
    public List<Object[]> getMonthlyStats() {
        return orderRepository.getMonthlyOrderStats(OrderStatus.DELIVERED);
    }
    
    // Kiểm tra user có quyền truy cập đơn hàng không
    public boolean canUserAccessOrder(Long userId, Long orderId) {
        Order order = getOrderById(orderId);
        return order.getUser().getId().equals(userId);
    }
    
    // Lấy thống kê tổng quan
    public OrderStatistics getOrderStatistics() {
        OrderStatistics stats = new OrderStatistics();
        stats.setTotalOrders(getTotalOrdersCount());
        stats.setPendingOrders(getPendingOrdersCount());
        stats.setConfirmedOrders(getConfirmedOrdersCount());
        stats.setShippedOrders(getShippedOrdersCount());
        stats.setDeliveredOrders(getDeliveredOrdersCount());
        stats.setCancelledOrders(getCancelledOrdersCount());
        stats.setTotalRevenue(getTotalRevenue());
        return stats;
    }
    
    // Inner class cho thống kê
    public static class OrderStatistics {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long shippedOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        private BigDecimal totalRevenue;
        
        // Constructors
        public OrderStatistics() {}
        
        // Getters and Setters
        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
        
        public long getPendingOrders() { return pendingOrders; }
        public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
        
        public long getConfirmedOrders() { return confirmedOrders; }
        public void setConfirmedOrders(long confirmedOrders) { this.confirmedOrders = confirmedOrders; }
        
        public long getShippedOrders() { return shippedOrders; }
        public void setShippedOrders(long shippedOrders) { this.shippedOrders = shippedOrders; }
        
        public long getDeliveredOrders() { return deliveredOrders; }
        public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }
        
        public long getCancelledOrders() { return cancelledOrders; }
        public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }
        
        public BigDecimal getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    }
} 