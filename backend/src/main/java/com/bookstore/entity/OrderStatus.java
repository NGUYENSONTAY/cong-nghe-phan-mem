package com.bookstore.entity;

public enum OrderStatus {
    PENDING,    // Chờ xử lý
    CONFIRMED,  // Đã xác nhận
    SHIPPED,    // Đã giao vận
    DELIVERED,  // Đã giao hàng
    CANCELLED   // Đã hủy
} 