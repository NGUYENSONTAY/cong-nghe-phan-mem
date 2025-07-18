package com.bookstore.dto;

import com.bookstore.entity.OrderItem;
import java.math.BigDecimal;

public class OrderItemSummaryDTO {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookImageUrl;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal subtotal;

    // Constructors
    public OrderItemSummaryDTO() {}

    public OrderItemSummaryDTO(OrderItem orderItem) {
        this.id = orderItem.getId();
        this.quantity = orderItem.getQuantity();
        this.price = orderItem.getPrice();
        this.subtotal = orderItem.getSubtotal();
        
        // Safely handle book information
        try {
            if (orderItem.getBook() != null) {
                this.bookId = orderItem.getBook().getId();
                this.bookTitle = orderItem.getBook().getTitle();
                this.bookImageUrl = orderItem.getBook().getImageUrl();
                
                // Safely get author name
                try {
                    if (orderItem.getBook().getAuthor() != null) {
                        this.bookAuthor = orderItem.getBook().getAuthor().getName();
                    }
                } catch (Exception e) {
                    this.bookAuthor = "N/A";
                }
            }
        } catch (Exception e) {
            // Lazy loading failed
            this.bookId = null;
            this.bookTitle = "N/A";
            this.bookAuthor = "N/A";
            this.bookImageUrl = null;
        }
    }

    // Static factory method cho OrderItem với JOIN FETCH
    public static OrderItemSummaryDTO fromOrderItemWithDetails(OrderItem orderItem) {
        OrderItemSummaryDTO dto = new OrderItemSummaryDTO();
        
        dto.setId(orderItem.getId());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());
        dto.setSubtotal(orderItem.getSubtotal());
        
        // Since we used JOIN FETCH, safely access book and author
        if (orderItem.getBook() != null) {
            dto.setBookId(orderItem.getBook().getId());
            dto.setBookTitle(orderItem.getBook().getTitle());
            dto.setBookImageUrl(orderItem.getBook().getImageUrl());
            
            if (orderItem.getBook().getAuthor() != null) {
                dto.setBookAuthor(orderItem.getBook().getAuthor().getName());
            }
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

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public void setBookTitle(String bookTitle) {
        this.bookTitle = bookTitle;
    }

    public String getBookAuthor() {
        return bookAuthor;
    }

    public void setBookAuthor(String bookAuthor) {
        this.bookAuthor = bookAuthor;
    }

    public String getBookImageUrl() {
        return bookImageUrl;
    }

    public void setBookImageUrl(String bookImageUrl) {
        this.bookImageUrl = bookImageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
} 