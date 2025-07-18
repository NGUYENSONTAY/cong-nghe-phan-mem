package com.bookstore.controller;

import com.bookstore.dto.BookSummaryDTO;
import com.bookstore.entity.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    // Lấy sách mới nhất - dùng DTO để tránh lazy loading
    @GetMapping("/latest")
    public ResponseEntity<?> getLatestBooks(@RequestParam(defaultValue = "8") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<Book> books = bookRepository.findAllByOrderByCreatedAtDesc(pageable).getContent();
            
            List<BookSummaryDTO> result = books.stream()
                .map(BookSummaryDTO::new) // Sử dụng constructor an toàn
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get latest books");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Lấy sách bán chạy - dùng DTO để tránh lazy loading
    @GetMapping("/bestsellers")
    public ResponseEntity<?> getBestSellingBooks(@RequestParam(defaultValue = "4") int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit);
            List<Book> books = bookRepository.findAllByOrderByStockQuantityDesc(pageable).getContent();
            
            List<BookSummaryDTO> result = books.stream()
                .map(BookSummaryDTO::new) // Sử dụng constructor an toàn
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get bestselling books");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Lấy sách theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        try {
            Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found"));
            
            BookSummaryDTO dto = new BookSummaryDTO(book);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Book not found");
            error.put("message", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // === New endpoint: Paginated list of books with basic filters ===
    @GetMapping
    public ResponseEntity<?> getBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(name = "limit", defaultValue = "10") int limit,
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        try {
            Pageable pageable = PageRequest.of(page, limit, 
                    sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());
            Page<Book> booksPage;

            if (title != null && !title.trim().isEmpty()) {
                booksPage = bookRepository.findByTitleContainingIgnoreCase(title, pageable);
            } else if (category != null) {
                booksPage = bookRepository.findByCategoryId(category, pageable);
            } else {
                booksPage = bookRepository.findAll(pageable);
            }

            List<BookSummaryDTO> bookDTOs = booksPage.getContent().stream()
                    .map(BookSummaryDTO::new)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("content", bookDTOs);
            response.put("totalElements", booksPage.getTotalElements());
            response.put("totalPages", booksPage.getTotalPages());
            response.put("number", booksPage.getNumber());
            response.put("size", booksPage.getSize());
            response.put("first", booksPage.isFirst());
            response.put("last", booksPage.isLast());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch books");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Test endpoint
    @GetMapping("/test")
    public ResponseEntity<?> testRepository() {
        try {
            long count = bookRepository.count();
            Map<String, Object> response = new HashMap<>();
            response.put("status", "OK");
            response.put("totalBooks", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Repository connection failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
} 