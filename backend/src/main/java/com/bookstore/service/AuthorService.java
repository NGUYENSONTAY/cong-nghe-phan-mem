package com.bookstore.service;

import com.bookstore.entity.Author;
import com.bookstore.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AuthorService {
    
    @Autowired
    private AuthorRepository authorRepository;
    
    // Lấy tất cả tác giả
    public List<Author> getAllAuthors() {
        return authorRepository.findAllByOrderByNameAsc();
    }
    
    // Lấy tác giả với pagination
    public Page<Author> getAllAuthors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return authorRepository.findAll(pageable);
    }
    
    // Lấy tác giả theo ID
    public Author getAuthorById(Long id) {
        return authorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy tác giả với ID: " + id));
    }
    
    // Tìm tác giả theo tên
    public List<Author> getAuthorsByName(String name) {
        return authorRepository.findByNameContainingIgnoreCase(name);
    }
    
    // Lấy tác giả theo quốc tịch
    public List<Author> getAuthorsByNationality(String nationality) {
        return authorRepository.findByNationalityIgnoreCase(nationality);
    }
    
    // Lấy tất cả quốc tịch duy nhất
    public List<String> getAllNationalities() {
        return authorRepository.findDistinctNationalities();
    }
    
    // Lấy tác giả có sách
    public List<Author> getAuthorsWithBooks() {
        return authorRepository.findByBooksIsNotEmpty();
    }
    
    // Lấy tác giả theo khoảng thời gian sinh - đơn giản hóa
    public List<Author> getAuthorsByBirthDateRange(LocalDate startDate, LocalDate endDate) {
        return authorRepository.findByBirthDateBetween(startDate, endDate);
    }
    
    // Tìm kiếm tác giả theo tên và quốc tịch - đơn giản hóa
    public List<Author> searchAuthors(String name, String nationality) {
        if (name != null && !name.trim().isEmpty()) {
            return authorRepository.findByNameContainingIgnoreCase(name);
        }
        if (nationality != null && !nationality.trim().isEmpty()) {
            return authorRepository.findByNationalityIgnoreCase(nationality);
        }
        return authorRepository.findAll();
    }
    
    // Tạo tác giả mới
    public Author createAuthor(Author author) {
        // Kiểm tra tên tác giả đã tồn tại chưa
        if (authorRepository.existsByName(author.getName())) {
            throw new RuntimeException("Tác giả đã tồn tại: " + author.getName());
        }
        
        return authorRepository.save(author);
    }
    
    // Cập nhật tác giả
    public Author updateAuthor(Long id, Author authorDetails) {
        Author author = getAuthorById(id);
        
        // Kiểm tra tên mới có bị trùng không (nếu thay đổi)
        if (!authorDetails.getName().equals(author.getName()) && 
            authorRepository.existsByName(authorDetails.getName())) {
            throw new RuntimeException("Tên tác giả đã tồn tại: " + authorDetails.getName());
        }
        
        author.setName(authorDetails.getName());
        author.setBiography(authorDetails.getBiography());
        author.setBirthDate(authorDetails.getBirthDate());
        author.setNationality(authorDetails.getNationality());
        
        return authorRepository.save(author);
    }
    
    // Xóa tác giả
    public void deleteAuthor(Long id) {
        if (!authorRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy tác giả với ID: " + id);
        }
        
        // Có thể kiểm tra tác giả có sách không trước khi xóa
        // Author author = getAuthorById(id);
        // if (author.getBooks().size() > 0) {
        //     throw new RuntimeException("Không thể xóa tác giả đã có sách");
        // }
        
        authorRepository.deleteById(id);
    }
    
    // Tìm tác giả theo tên chính xác
    public Author getAuthorByName(String name) {
        return authorRepository.findByName(name)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy tác giả: " + name));
    }
    
    // Thống kê tác giả
    public long getTotalAuthors() {
        return authorRepository.count();
    }
    
    // Get all authors with filters for admin
    public Page<Author> getAllAuthorsWithFilters(
            Pageable pageable, 
            String name, 
            String nationality
    ) {
        if (name != null || nationality != null) {
            return authorRepository.findAuthorsWithFilters(name, nationality, pageable);
        }
        return authorRepository.findAll(pageable);
    }
    
    // Save author
    public Author saveAuthor(Author author) {
        return authorRepository.save(author);
    }
    
    // Update author (simplified version)
    public Author updateAuthor(Author author) {
        return authorRepository.save(author);
    }
    
    // Check if author has books
    public boolean hasBooks(Long authorId) {
        return authorRepository.countBooksByAuthorId(authorId) > 0;
    }
    
    // Get statistics
    public long getAuthorsWithBooksCount() {
        return authorRepository.countAuthorsWithBooks();
    }
    
    public long getAuthorsWithoutBooksCount() {
        return getTotalAuthors() - getAuthorsWithBooksCount();
    }
    
    // Search authors by name
    public List<Author> searchAuthorsByName(String query) {
        return authorRepository.findByNameContainingIgnoreCase(query);
    }
    
    // Bulk delete authors
    public void bulkDeleteAuthors(List<Long> authorIds) {
        authorRepository.deleteAllById(authorIds);
    }
    
    // Lấy tác giả có nhiều sách nhất - đơn giản hóa
    public List<Author> getTopAuthors(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return authorRepository.findAll(pageable).getContent();
    }
}