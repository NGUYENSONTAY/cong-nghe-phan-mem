package com.bookstore.dto;

import com.bookstore.entity.Author;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AuthorSummaryDTO {
    private Long id;
    private String name;
    private String biography;
    private String bio;
    private String imageUrl;
    private LocalDate birthDate;
    private String nationality;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int bookCount;

    // Constructors
    public AuthorSummaryDTO() {}

    public AuthorSummaryDTO(Author author) {
        this.id = author.getId();
        this.name = author.getName();
        this.biography = author.getBiography();
        this.bio = author.getBio();
        this.imageUrl = author.getImageUrl();
        this.birthDate = author.getBirthDate();
        this.nationality = author.getNationality();
        this.createdAt = author.getCreatedAt();
        this.updatedAt = author.getUpdatedAt();
        
        // KHÔNG truy cập lazy collections
        this.bookCount = 0; // Sẽ được set sau nếu cần
    }

    // Static factory method
    public static AuthorSummaryDTO fromAuthor(Author author) {
        return new AuthorSummaryDTO(author);
    }

    // Static factory method với book count
    public static AuthorSummaryDTO fromAuthorWithBookCount(Author author, int bookCount) {
        AuthorSummaryDTO dto = new AuthorSummaryDTO(author);
        dto.setBookCount(bookCount);
        return dto;
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

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
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

    public int getBookCount() {
        return bookCount;
    }

    public void setBookCount(int bookCount) {
        this.bookCount = bookCount;
    }

    // Helper method để get age
    public int getAge() {
        if (birthDate != null) {
            return LocalDate.now().getYear() - birthDate.getYear();
        }
        return 0;
    }
} 