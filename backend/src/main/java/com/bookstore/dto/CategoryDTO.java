package com.bookstore.dto;

import com.bookstore.entity.Category;

public class CategoryDTO {
    private Long id;
    private String name;
    private String description;
    private int bookCount;

    // Constructors
    public CategoryDTO() {}

    public CategoryDTO(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.description = category.getDescription();
        // KHÔNG gọi category.getBooks() để tránh lazy loading
        this.bookCount = 0; // Sẽ set sau nếu cần
    }

    public CategoryDTO(Long id, String name, String description, int bookCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.bookCount = bookCount;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getBookCount() {
        return bookCount;
    }

    public void setBookCount(int bookCount) {
        this.bookCount = bookCount;
    }
} 