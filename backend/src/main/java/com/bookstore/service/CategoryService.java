package com.bookstore.service;

import com.bookstore.entity.Category;
import com.bookstore.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    // Lấy tất cả thể loại - sử dụng JPA method
    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }
    
    // Lấy thể loại theo ID
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại với ID: " + id));
    }
    
    // Lấy thể loại theo tên
    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại với tên: " + name));
    }
    
    // Tìm kiếm thể loại theo tên
    public List<Category> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContainingIgnoreCase(name);
    }
    
    // Lấy thể loại có sách - sử dụng JPA method
    public List<Category> getCategoriesWithBooks() {
        return categoryRepository.findByBooksIsNotEmpty();
    }
    
    // Tạo thể loại mới
    public Category createCategory(Category category) {
        // Kiểm tra tên thể loại đã tồn tại
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Thể loại đã tồn tại: " + category.getName());
        }
        
        return categoryRepository.save(category);
    }
    
    // Cập nhật thể loại
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        
        // Kiểm tra tên thể loại đã tồn tại (nếu thay đổi)
        if (!categoryDetails.getName().equals(category.getName()) && 
            categoryRepository.existsByName(categoryDetails.getName())) {
            throw new RuntimeException("Thể loại đã tồn tại: " + categoryDetails.getName());
        }
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        
        return categoryRepository.save(category);
    }
    
    // Xóa thể loại - cải thiện logic kiểm tra
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        
        // Kiểm tra có sách nào thuộc thể loại này không bằng cách đếm
        long bookCount = category.getBooks() != null ? category.getBooks().size() : 0;
        if (bookCount > 0) {
            throw new RuntimeException("Không thể xóa thể loại vì vẫn còn " + bookCount + " sách thuộc thể loại này");
        }
        
        categoryRepository.deleteById(id);
    }
    
    // Kiểm tra tên thể loại có sẵn
    public boolean isCategoryNameAvailable(String name) {
        return !categoryRepository.existsByName(name);
    }
    
    // Đếm số thể loại
    public long getTotalCategoriesCount() {
        return categoryRepository.count();
    }
} 