package com.bookstore.controller;

import com.bookstore.dto.BookSummaryDTO;
import com.bookstore.entity.Book;
import com.bookstore.entity.Author;
import com.bookstore.entity.Category;
import com.bookstore.service.BookService;
import com.bookstore.service.AuthorService;
import com.bookstore.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/books")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private AuthorService authorService;

    @Autowired
    private CategoryService categoryService;

    // Lấy danh sách sách với pagination, search và filter
    @GetMapping
    public ResponseEntity<?> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean inStock
    ) {
        try {
            // Tạo Sort object
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Gọi service với filters
            Page<Book> booksPage = bookService.getAllBooksWithFilters(
                pageable, title, author, categoryId, minPrice, maxPrice, inStock
            );
            
            // Convert to DTOs với full details (sử dụng JOIN FETCH)
            List<BookSummaryDTO> bookDTOs = booksPage.getContent().stream()
                .map(BookSummaryDTO::fromBookWithDetails)
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

    // Lấy sách theo ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable Long id) {
        try {
            Book book = bookService.getBookById(id);
            if (book == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Book not found");
                return ResponseEntity.notFound().build();
            }
            
            BookSummaryDTO dto = BookSummaryDTO.fromBookWithDetails(book);
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch book");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Tạo sách mới
    @PostMapping
    public ResponseEntity<?> createBook(@RequestBody Map<String, Object> bookData) {
        try {
            // Validate required fields
            if (!bookData.containsKey("title") || !bookData.containsKey("authorId") || 
                !bookData.containsKey("categoryId") || !bookData.containsKey("price")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Missing required fields: title, authorId, categoryId, price");
                return ResponseEntity.badRequest().body(error);
            }

            Book book = new Book();
            book.setTitle((String) bookData.get("title"));
            book.setDescription((String) bookData.get("description"));
            
            // Convert price
            Object priceObj = bookData.get("price");
            BigDecimal price = priceObj instanceof Number 
                ? BigDecimal.valueOf(((Number) priceObj).doubleValue())
                : new BigDecimal(priceObj.toString());
            book.setPrice(price);
            
            // Convert stock quantity
            Object stockObj = bookData.get("stockQuantity");
            int stockQuantity = stockObj instanceof Number 
                ? ((Number) stockObj).intValue() 
                : Integer.parseInt(stockObj.toString());
            book.setStockQuantity(stockQuantity);

            // Set author
            Long authorId = Long.valueOf(bookData.get("authorId").toString());
            Author author = authorService.getAuthorById(authorId);
            if (author == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Author not found");
                return ResponseEntity.badRequest().body(error);
            }
            book.setAuthor(author);

            // Set category
            Long categoryId = Long.valueOf(bookData.get("categoryId").toString());
            Category category = categoryService.getCategoryById(categoryId);
            if (category == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Category not found");
                return ResponseEntity.badRequest().body(error);
            }
            book.setCategory(category);

            // Set images if provided
            if (bookData.containsKey("images")) {
                @SuppressWarnings("unchecked")
                List<String> images = (List<String>) bookData.get("images");
                book.setImages(images);
                // Nếu imageUrl chưa có, gán ảnh đầu tiên làm cover
                if ((book.getImageUrl() == null || book.getImageUrl().trim().isEmpty()) && images != null && !images.isEmpty()) {
                    book.setImageUrl(images.get(0));
                }
            }

            book.setCreatedAt(LocalDateTime.now());
            book.setUpdatedAt(LocalDateTime.now());

            Book savedBook = bookService.saveBook(book);
            BookSummaryDTO dto = BookSummaryDTO.fromBookWithDetails(savedBook);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create book");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Cập nhật sách
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBook(@PathVariable Long id, @RequestBody Map<String, Object> bookData) {
        try {
            Book existingBook = bookService.getBookById(id);
            if (existingBook == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Book not found");
                return ResponseEntity.notFound().build();
            }

            // Update fields if provided
            if (bookData.containsKey("title")) {
                existingBook.setTitle((String) bookData.get("title"));
            }
            if (bookData.containsKey("description")) {
                existingBook.setDescription((String) bookData.get("description"));
            }
            if (bookData.containsKey("price")) {
                Object priceObj = bookData.get("price");
                BigDecimal price = priceObj instanceof Number 
                    ? BigDecimal.valueOf(((Number) priceObj).doubleValue())
                    : new BigDecimal(priceObj.toString());
                existingBook.setPrice(price);
            }
            if (bookData.containsKey("stockQuantity")) {
                Object stockObj = bookData.get("stockQuantity");
                int stockQuantity = stockObj instanceof Number 
                    ? ((Number) stockObj).intValue() 
                    : Integer.parseInt(stockObj.toString());
                existingBook.setStockQuantity(stockQuantity);
            }

            // Update author if provided
            if (bookData.containsKey("authorId")) {
                Long authorId = Long.valueOf(bookData.get("authorId").toString());
                Author author = authorService.getAuthorById(authorId);
                if (author == null) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Author not found");
                    return ResponseEntity.badRequest().body(error);
                }
                existingBook.setAuthor(author);
            }

            // Update category if provided
            if (bookData.containsKey("categoryId")) {
                Long categoryId = Long.valueOf(bookData.get("categoryId").toString());
                Category category = categoryService.getCategoryById(categoryId);
                if (category == null) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Category not found");
                    return ResponseEntity.badRequest().body(error);
                }
                existingBook.setCategory(category);
            }

            // Update images if provided
            if (bookData.containsKey("images")) {
                @SuppressWarnings("unchecked")
                List<String> images = (List<String>) bookData.get("images");
                existingBook.setImages(images);
                if ((existingBook.getImageUrl() == null || existingBook.getImageUrl().trim().isEmpty()) && images != null && !images.isEmpty()) {
                    existingBook.setImageUrl(images.get(0));
                }
            }

            existingBook.setUpdatedAt(LocalDateTime.now());

            Book updatedBook = bookService.saveBook(existingBook);
            BookSummaryDTO dto = BookSummaryDTO.fromBookWithDetails(updatedBook);
            
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update book");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Xóa sách
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id) {
        try {
            Book book = bookService.getBookById(id);
            if (book == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Book not found");
                return ResponseEntity.notFound().build();
            }

            bookService.deleteBook(id);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Book deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete book");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Xóa nhiều sách
    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteBulkBooks(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> ids = request.get("ids");
            if (ids == null || ids.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No book IDs provided");
                return ResponseEntity.badRequest().body(error);
            }

            int deletedCount = bookService.deleteBulkBooks(ids);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Books deleted successfully");
            response.put("deletedCount", deletedCount);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete books");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Toggle trạng thái stock của sách
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> toggleBookStock(@PathVariable Long id) {
        try {
            Book book = bookService.getBookById(id);
            if (book == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Book not found");
                return ResponseEntity.notFound().build();
            }

            // Toggle stock: if > 0 set to 0, if 0 set to 1
            int newStock = book.getStockQuantity() > 0 ? 0 : 1;
            book.setStockQuantity(newStock);
            book.setUpdatedAt(LocalDateTime.now());

            Book updatedBook = bookService.saveBook(book);
            BookSummaryDTO dto = BookSummaryDTO.fromBookWithDetails(updatedBook);
            
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to toggle book stock");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
