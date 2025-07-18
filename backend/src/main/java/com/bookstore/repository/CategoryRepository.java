package com.bookstore.repository;

import com.bookstore.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // Tìm theo tên chính xác
    Optional<Category> findByName(String name);
    
    // Kiểm tra tồn tại theo tên
    boolean existsByName(String name);
    
    // Tìm theo tên chứa chuỗi (không phân biệt hoa thường)
    List<Category> findByNameContainingIgnoreCase(String name);
    
    // Tìm tất cả và sắp xếp theo tên
    List<Category> findAllByOrderByNameAsc();
    
    // Tìm categories có ít nhất 1 book (sử dụng JPA method)
    List<Category> findByBooksIsNotEmpty();
} 