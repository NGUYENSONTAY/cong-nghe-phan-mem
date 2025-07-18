package com.bookstore.controller;

import com.bookstore.dto.AuthorSummaryDTO;
import com.bookstore.entity.Author;
import com.bookstore.service.AuthorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/authors")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuthorController {

    @Autowired
    private AuthorService authorService;

    // Get all unique nationalities
    @GetMapping("/nationalities")
    public ResponseEntity<?> getAllNationalities() {
        try {
            List<String> nationalities = authorService.getAllNationalities();
            return ResponseEntity.ok(nationalities);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get nationalities");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get all authors with pagination and filters
    @GetMapping
    public ResponseEntity<?> getAllAuthors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String nationality
    ) {
        try {
            // Create Sort object
            Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            
            // Get authors with filters
            Page<Author> authorsPage = authorService.getAllAuthorsWithFilters(
                pageable, name, nationality
            );
            
            // Convert to DTOs để tránh lazy loading
            List<AuthorSummaryDTO> authorDTOs = authorsPage.getContent().stream()
                .map(AuthorSummaryDTO::fromAuthor)
                .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", authorDTOs);
            response.put("totalElements", authorsPage.getTotalElements());
            response.put("totalPages", authorsPage.getTotalPages());
            response.put("number", authorsPage.getNumber());
            response.put("size", authorsPage.getSize());
            response.put("first", authorsPage.isFirst());
            response.put("last", authorsPage.isLast());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch authors");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get author by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getAuthorById(@PathVariable Long id) {
        try {
            Author author = authorService.getAuthorById(id);
            if (author == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Author not found");
                return ResponseEntity.notFound().build();
            }
            AuthorSummaryDTO dto = AuthorSummaryDTO.fromAuthor(author);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch author");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Create new author
    @PostMapping
    public ResponseEntity<?> createAuthor(@RequestBody Map<String, Object> authorData) {
        try {
            Author author = new Author();
            author.setName((String) authorData.get("name"));
            
            if (authorData.containsKey("bio")) {
                author.setBio((String) authorData.get("bio"));
            }
            if (authorData.containsKey("nationality")) {
                author.setNationality((String) authorData.get("nationality"));
            }
            if (authorData.containsKey("imageUrl")) {
                author.setImageUrl((String) authorData.get("imageUrl"));
            }
            if (authorData.containsKey("birthDate") && authorData.get("birthDate") != null) {
                String birthDateStr = (String) authorData.get("birthDate");
                if (!birthDateStr.trim().isEmpty()) {
                    author.setBirthDate(LocalDate.parse(birthDateStr));
                }
            }

            author.setCreatedAt(LocalDateTime.now());
            author.setUpdatedAt(LocalDateTime.now());

            Author savedAuthor = authorService.saveAuthor(author);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedAuthor);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create author");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Update author
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAuthor(@PathVariable Long id, @RequestBody Map<String, Object> authorData) {
        try {
            Author existingAuthor = authorService.getAuthorById(id);
            if (existingAuthor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Author not found");
                return ResponseEntity.notFound().build();
            }

            // Update fields if provided
            if (authorData.containsKey("name")) {
                existingAuthor.setName((String) authorData.get("name"));
            }
            if (authorData.containsKey("bio")) {
                existingAuthor.setBio((String) authorData.get("bio"));
            }
            if (authorData.containsKey("nationality")) {
                existingAuthor.setNationality((String) authorData.get("nationality"));
            }
            if (authorData.containsKey("imageUrl")) {
                existingAuthor.setImageUrl((String) authorData.get("imageUrl"));
            }
            if (authorData.containsKey("birthDate") && authorData.get("birthDate") != null) {
                String birthDateStr = (String) authorData.get("birthDate");
                if (!birthDateStr.trim().isEmpty()) {
                    existingAuthor.setBirthDate(LocalDate.parse(birthDateStr));
                }
            }

            existingAuthor.setUpdatedAt(LocalDateTime.now());

            Author updatedAuthor = authorService.updateAuthor(existingAuthor);
            return ResponseEntity.ok(updatedAuthor);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update author");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Delete author
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAuthor(@PathVariable Long id) {
        try {
            Author existingAuthor = authorService.getAuthorById(id);
            if (existingAuthor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Author not found");
                return ResponseEntity.notFound().build();
            }

            // Check if author has books
            if (authorService.hasBooks(id)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cannot delete author");
                error.put("message", "Author has books associated. Please remove or reassign books first.");
                return ResponseEntity.badRequest().body(error);
            }

            authorService.deleteAuthor(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Author deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete author");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Get author statistics
    @GetMapping("/statistics")
    public ResponseEntity<?> getAuthorStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalAuthors", authorService.getTotalAuthors());
            stats.put("authorsWithBooks", authorService.getAuthorsWithBooksCount());
            stats.put("authorsWithoutBooks", authorService.getAuthorsWithoutBooksCount());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get author statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Bulk delete authors
    @PostMapping("/bulk-delete")
    public ResponseEntity<?> bulkDeleteAuthors(@RequestBody Map<String, List<Long>> requestData) {
        try {
            List<Long> authorIds = requestData.get("ids");
            
            // Check if any author has books
            for (Long authorId : authorIds) {
                if (authorService.hasBooks(authorId)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Cannot delete some authors");
                    error.put("message", "Some authors have books associated. Please remove or reassign books first.");
                    return ResponseEntity.badRequest().body(error);
                }
            }
            
            authorService.bulkDeleteAuthors(authorIds);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Authors deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete authors");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Search authors
    @GetMapping("/search")
    public ResponseEntity<?> searchAuthors(@RequestParam String q) {
        try {
            List<Author> authors = authorService.searchAuthorsByName(q);
            return ResponseEntity.ok(authors);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to search authors");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
