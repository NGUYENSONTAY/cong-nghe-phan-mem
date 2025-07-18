package com.bookstore.controller;

import com.bookstore.dto.CategoryDTO;
import com.bookstore.entity.Category;
import com.bookstore.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // Helper method để convert Category thành Map an toàn
    private Map<String, Object> categoryToMap(Category category) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", category.getId());
        map.put("name", category.getName());
        map.put("description", category.getDescription());
        map.put("bookCount", 0); // Mặc định 0, không truy cập lazy collection
        return map;
    }

    // Lấy tất cả thể loại (public) - dùng trực tiếp repository
    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findAllByOrderByNameAsc();
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Category cat : categories) {
                result.add(categoryToMap(cat));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get categories");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Lấy thể loại theo ID (public)
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        try {
            Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
            return ResponseEntity.ok(categoryToMap(category));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Category not found");
            error.put("message", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    // Tìm kiếm thể loại theo tên (public)
    @GetMapping("/search")
    public ResponseEntity<?> searchCategories(@RequestParam String name) {
        try {
            List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(name);
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Category cat : categories) {
                result.add(categoryToMap(cat));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to search categories");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // Lấy thể loại có sách (public)
    @GetMapping("/with-books")
    public ResponseEntity<?> getCategoriesWithBooks() {
        try {
            List<Category> categories = categoryRepository.findByBooksIsNotEmpty();
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Category cat : categories) {
                result.add(categoryToMap(cat));
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get categories with books");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // === ADMIN ENDPOINTS ===

    // Tạo thể loại mới (chỉ admin)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCategory(@Valid @RequestBody Category category) {
        try {
            if (categoryRepository.existsByName(category.getName())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Category already exists");
                error.put("message", "Thể loại đã tồn tại: " + category.getName());
                return ResponseEntity.badRequest().body(error);
            }
            
            Category createdCategory = categoryRepository.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(categoryToMap(createdCategory));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Cập nhật thể loại (chỉ admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody Category categoryDetails) {
        try {
            Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
            
            if (!categoryDetails.getName().equals(category.getName()) && 
                categoryRepository.existsByName(categoryDetails.getName())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Category name already exists");
                error.put("message", "Thể loại đã tồn tại: " + categoryDetails.getName());
                return ResponseEntity.badRequest().body(error);
            }
            
            category.setName(categoryDetails.getName());
            category.setDescription(categoryDetails.getDescription());
            
            Category updatedCategory = categoryRepository.save(category);
            return ResponseEntity.ok(categoryToMap(updatedCategory));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Xóa thể loại (chỉ admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
            
            // Kiểm tra có sách nào thuộc thể loại này không mà không truy cập lazy collection
            // Có thể dùng count query riêng nếu cần
            
            categoryRepository.deleteById(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa thể loại thành công");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Kiểm tra tên thể loại có sẵn (admin)
    @GetMapping("/check-name")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> checkCategoryName(@RequestParam String name) {
        boolean isAvailable = !categoryRepository.existsByName(name);
        Map<String, Boolean> response = new HashMap<>();
        response.put("available", isAvailable);
        return ResponseEntity.ok(response);
    }

    // Thống kê thể loại (admin)
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getCategoryStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalCategories", categoryRepository.count());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get stats");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 