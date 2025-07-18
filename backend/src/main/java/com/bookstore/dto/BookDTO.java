package com.bookstore.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class BookDTO {
    
    @NotBlank(message = "Tiêu đề sách không được để trống")
    @Size(min = 1, max = 255, message = "Tiêu đề sách phải từ 1-255 ký tự")
    private String title;
    
    @Size(max = 2000, message = "Mô tả không được quá 2000 ký tự")
    private String description;
    
    @Size(max = 20, message = "ISBN không được quá 20 ký tự")
    private String isbn;
    
    @NotNull(message = "Giá sách không được để trống")
    @PositiveOrZero(message = "Giá sách phải lớn hơn hoặc bằng 0")
    private BigDecimal price;
    
    @PositiveOrZero(message = "Số lượng tồn kho phải lớn hơn hoặc bằng 0")
    private Integer stockQuantity;
    
    private List<String> images;
    
    @PositiveOrZero(message = "Số trang phải lớn hơn hoặc bằng 0")
    private Integer pages;
    
    @Size(max = 50, message = "Ngôn ngữ không được quá 50 ký tự")
    private String language;
    
    private Long categoryId;
    private Long authorId;
    private String author; // Support author name for easier frontend integration
    
    // Constructors
    public BookDTO() {}
    
    public BookDTO(String title, String description, BigDecimal price, Long categoryId, Long authorId) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.categoryId = categoryId;
        this.authorId = authorId;
    }
    
    // Getters and Setters
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIsbn() {
        return isbn;
    }
    
    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getStockQuantity() {
        return stockQuantity;
    }
    
    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }
    
    public List<String> getImages() {
        return images;
    }
    public void setImages(List<String> images) {
        this.images = images;
    }
    
    public Integer getPages() {
        return pages;
    }
    
    public void setPages(Integer pages) {
        this.pages = pages;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public Long getCategoryId() {
        return categoryId;
    }
    
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }
    
    public Long getAuthorId() {
        return authorId;
    }
    
    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
} 