package com.bookstore.controller;

import com.bookstore.entity.Author;
import com.bookstore.repository.AuthorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/authors")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class AuthorController {

    @Autowired
    private AuthorRepository authorRepository;

    // Test endpoint - đặt lên đầu
    @GetMapping("/test")
    public ResponseEntity<?> testRepository() {
        try {
            long count = authorRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "OK");
            response.put("totalAuthors", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Repository connection failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Debug endpoint - count only
    @GetMapping("/debug-count")
    public ResponseEntity<?> debugCount() {
        try {
            long count = authorRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("totalAuthors", count);
            response.put("message", "Count successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Count failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Helper method để convert Author thành Map an toàn (giống CategoryController)
    private Map<String, Object> authorToMap(Author author) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", author.getId());
        map.put("name", author.getName());
        map.put("biography", author.getBiography());
        map.put("birthDate", author.getBirthDate());
        map.put("nationality", author.getNationality());
        map.put("bookCount", 0); // Không truy cập lazy collection
        return map;
    }

    // Lấy tất cả tác giả - dùng Map để tránh lazy loading
    @GetMapping
    public ResponseEntity<?> getAllAuthors() {
        try {
            List<Author> authors = authorRepository.findAll();
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Author author : authors) {
                result.add(authorToMap(author));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get authors");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
} 