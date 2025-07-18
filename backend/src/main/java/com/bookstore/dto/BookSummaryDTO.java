package com.bookstore.dto;

import com.bookstore.entity.Book;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookSummaryDTO {
    private Long id;
    private String title;
    private String description;
    private String isbn;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private List<String> images;
    private Integer pages;
    private String language;
    private String categoryName;
    private Long categoryId;
    private String authorName;
    private Long authorId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean inStock;

    // Constructors
    public BookSummaryDTO() {}

    public BookSummaryDTO(Book book) {
        this.id = book.getId();
        this.title = book.getTitle();
        this.description = book.getDescription();
        this.isbn = book.getIsbn();
        this.price = book.getPrice();
        this.stockQuantity = book.getStockQuantity();
        this.imageUrl = book.getImageUrl();
        
        // Safely handle images collection
        try {
            if (book.getImages() != null && !book.getImages().isEmpty()) {
                this.images = new ArrayList<>(book.getImages());
            } else {
                this.images = new ArrayList<>();
            }
        } catch (Exception e) {
            // Lazy loading failed, use empty list
            this.images = new ArrayList<>();
        }
        // Fallback: ensure at least cover image present
        if ((this.images == null || this.images.isEmpty()) && book.getImageUrl() != null) {
            if (this.images == null) this.images = new ArrayList<>();
            this.images.add(book.getImageUrl());
        }
        
        this.pages = book.getPages();
        this.language = book.getLanguage();
        this.createdAt = book.getCreatedAt();
        this.updatedAt = book.getUpdatedAt();
        this.inStock = book.isInStock();
        
        // Safely handle category association
        try {
            if (book.getCategory() != null) {
                this.categoryName = book.getCategory().getName();
                this.categoryId = book.getCategory().getId();
            }
        } catch (Exception e) {
            // Lazy loading failed, set to null
            this.categoryName = null;
            this.categoryId = null;
        }
        
        // Safely handle author association
        try {
            if (book.getAuthor() != null) {
                this.authorName = book.getAuthor().getName();
                this.authorId = book.getAuthor().getId();
            }
        } catch (Exception e) {
            // Lazy loading failed, set to null
            this.authorName = null;
            this.authorId = null;
        }
    }

    // Static factory method cho Book với JOIN FETCH (đã load category và author)
    public static BookSummaryDTO fromBookWithDetails(Book book) {
        BookSummaryDTO dto = new BookSummaryDTO();
        
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setDescription(book.getDescription());
        dto.setIsbn(book.getIsbn());
        dto.setPrice(book.getPrice());
        dto.setStockQuantity(book.getStockQuantity());
        dto.setImageUrl(book.getImageUrl());
        dto.setPages(book.getPages());
        dto.setLanguage(book.getLanguage());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        dto.setInStock(book.isInStock());
        
        // Safely handle images collection (even with FETCH)
        try {
            if (book.getImages() != null && !book.getImages().isEmpty()) {
                dto.setImages(new ArrayList<>(book.getImages()));
            } else {
                dto.setImages(new ArrayList<>());
            }
        } catch (Exception e) {
            dto.setImages(new ArrayList<>());
        }
        if ((dto.getImages() == null || dto.getImages().isEmpty()) && book.getImageUrl() != null) {
            if (dto.getImages() == null) dto.setImages(new ArrayList<>());
            dto.getImages().add(book.getImageUrl());
        }
        
        // Since we used JOIN FETCH, safely access category and author
        if (book.getCategory() != null) {
            dto.setCategoryName(book.getCategory().getName());
            dto.setCategoryId(book.getCategory().getId());
        }
        
        if (book.getAuthor() != null) {
            dto.setAuthorName(book.getAuthor().getName());
            dto.setAuthorId(book.getAuthor().getId());
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public void setAuthorId(Long authorId) {
        this.authorId = authorId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }
} 