package com.bookstore.repository;

import com.bookstore.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    // Tìm theo ISBN
    Optional<Book> findByIsbn(String isbn);
    
    // Tìm theo category ID
    List<Book> findByCategoryId(Long categoryId);
    
    // Tìm theo author ID  
    List<Book> findByAuthorId(Long authorId);
    
    // Tìm sách còn hàng
    List<Book> findByStockQuantityGreaterThan(Integer stockQuantity);
    
    // Tìm kiếm theo title hoặc description
    List<Book> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);
    
    // Sắp xếp theo ngày tạo mới nhất (dùng với Pageable)
    Page<Book> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    // Sắp xếp theo stock quantity (bestsellers)
    Page<Book> findAllByOrderByStockQuantityDesc(Pageable pageable);
    
    // Tìm theo khoảng giá
    List<Book> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);
    
    // Tìm theo ngôn ngữ
    List<Book> findByLanguageIgnoreCase(String language);
    
    // Kiểm tra tồn tại theo ISBN
    boolean existsByIsbn(String isbn);
    
    // Additional methods for AdminBookController with pagination
    
    // Tìm theo title với pagination
    Page<Book> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    
    // Tìm theo category với pagination
    Page<Book> findByCategoryId(Long categoryId, Pageable pageable);
    
    // Tìm sách còn hàng với pagination
    Page<Book> findByStockQuantityGreaterThan(Integer stockQuantity, Pageable pageable);
    
    // ===== NEW METHODS WITH JOIN FETCH để tránh lazy loading =====
    
    // Lấy tất cả sách với JOIN FETCH category và author
    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.author " +
           "ORDER BY b.createdAt DESC")
    Page<Book> findAllWithCategoryAndAuthor(Pageable pageable);
    
    // Tìm theo title với JOIN FETCH
    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.author " +
           "WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Book> findByTitleContainingIgnoreCaseWithCategoryAndAuthor(@Param("title") String title, Pageable pageable);
    
    // Tìm theo category với JOIN FETCH
    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN FETCH b.category c " +
           "LEFT JOIN FETCH b.author " +
           "WHERE c.id = :categoryId")
    Page<Book> findByCategoryIdWithCategoryAndAuthor(@Param("categoryId") Long categoryId, Pageable pageable);
    
    // Tìm sách còn hàng với JOIN FETCH
    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.author " +
           "WHERE b.stockQuantity > :stockQuantity")
    Page<Book> findByStockQuantityGreaterThanWithCategoryAndAuthor(@Param("stockQuantity") Integer stockQuantity, Pageable pageable);
    
    // Lấy sách mới nhất với JOIN FETCH
    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.author " +
           "ORDER BY b.createdAt DESC")
    Page<Book> findAllByOrderByCreatedAtDescWithCategoryAndAuthor(Pageable pageable);
    
    // Lấy sách bán chạy với JOIN FETCH 
    @Query("SELECT DISTINCT b FROM Book b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.author " +
           "ORDER BY b.stockQuantity DESC")
    Page<Book> findAllByOrderByStockQuantityDescWithCategoryAndAuthor(Pageable pageable);
    
    // Tìm theo ID với JOIN FETCH
    @Query("SELECT b FROM Book b " +
           "LEFT JOIN FETCH b.category " +
           "LEFT JOIN FETCH b.author " +
           "WHERE b.id = :id")
    Optional<Book> findByIdWithCategoryAndAuthor(@Param("id") Long id);
}