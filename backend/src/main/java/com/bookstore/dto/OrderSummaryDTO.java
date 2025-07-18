package com.bookstore.dto;

import com.bookstore.entity.Order;
import com.bookstore.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class OrderSummaryDTO {
    private Long id;
    private String userName;
    private String userEmail;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String shippingAddress;
    private String paymentMethod;
    private LocalDateTime orderDate;
    private List<OrderItemSummaryDTO> orderItems;
    private int totalItems;

    // Constructors
    public OrderSummaryDTO() {}

    public OrderSummaryDTO(Order order) {
        this.id = order.getId();
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.shippingAddress = order.getShippingAddress();
        this.paymentMethod = order.getPaymentMethod();
        this.orderDate = order.getOrderDate();
        
        // Safely handle user information
        try {
            if (order.getUser() != null) {
                this.userName = order.getUser().getFirstName() + " " + order.getUser().getLastName();
                this.userEmail = order.getUser().getEmail();
            }
        } catch (Exception e) {
            // Lazy loading failed
            this.userName = "N/A";
            this.userEmail = "N/A";
        }
        
        // Safely handle order items
        try {
            if (order.getOrderItems() != null) {
                this.orderItems = order.getOrderItems().stream()
                    .map(OrderItemSummaryDTO::new)
                    .collect(Collectors.toList());
                this.totalItems = order.getTotalItems();
            } else {
                this.orderItems = new ArrayList<>();
                this.totalItems = 0;
            }
        } catch (Exception e) {
            // Lazy loading failed
            this.orderItems = new ArrayList<>();
            this.totalItems = 0;
        }
    }

    // Static factory method cho Order với JOIN FETCH
    public static OrderSummaryDTO fromOrderWithDetails(Order order) {
        OrderSummaryDTO dto = new OrderSummaryDTO();
        
        dto.setId(order.getId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setOrderDate(order.getOrderDate());
        
        // Since we used JOIN FETCH, safely access user and order items
        if (order.getUser() != null) {
            dto.setUserName(order.getUser().getFirstName() + " " + order.getUser().getLastName());
            dto.setUserEmail(order.getUser().getEmail());
        }
        
        if (order.getOrderItems() != null) {
            dto.setOrderItems(order.getOrderItems().stream()
                .map(OrderItemSummaryDTO::fromOrderItemWithDetails)
                .collect(Collectors.toList()));
            dto.setTotalItems(order.getTotalItems());
        } else {
            dto.setOrderItems(new ArrayList<>());
            dto.setTotalItems(0);
        }
        
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public List<OrderItemSummaryDTO> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItemSummaryDTO> orderItems) {
        this.orderItems = orderItems;
    }

    public int getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
} 