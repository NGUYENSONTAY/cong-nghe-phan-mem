package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class OrderDTO {
    
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;
    
    private String paymentMethod;
    
    @NotEmpty(message = "Danh sách sản phẩm không được để trống")
    private List<OrderItemDTO> orderItems;
    
    // Constructors
    public OrderDTO() {}
    
    public OrderDTO(String shippingAddress, String paymentMethod, List<OrderItemDTO> orderItems) {
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.orderItems = orderItems;
    }
    
    // Getters and Setters
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
    
    public List<OrderItemDTO> getOrderItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItemDTO> orderItems) {
        this.orderItems = orderItems;
    }
    
    // Inner class for OrderItem DTO
    public static class OrderItemDTO {
        
        @NotNull(message = "ID sách không được để trống")
        private Long bookId;
        
        @NotNull(message = "Số lượng không được để trống")
        private Integer quantity;
        
        // Constructors
        public OrderItemDTO() {}
        
        public OrderItemDTO(Long bookId, Integer quantity) {
            this.bookId = bookId;
            this.quantity = quantity;
        }
        
        // Getters and Setters
        public Long getBookId() {
            return bookId;
        }
        
        public void setBookId(Long bookId) {
            this.bookId = bookId;
        }
        
        public Integer getQuantity() {
            return quantity;
        }
        
        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
} 