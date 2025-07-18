package com.bookstore.repository;

import com.bookstore.entity.Author;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuthorRepository extends JpaRepository<Author, Long> {
    
    // Tìm theo tên (chính xác)
    Optional<Author> findByName(String name);
    
    // Tìm theo tên (chứa từ khóa, không phân biệt hoa thường)
    List<Author> findByNameContainingIgnoreCase(String name);
    
    // Sắp xếp theo tên A-Z
    List<Author> findAllByOrderByNameAsc();
    
    // Tìm theo quốc tịch
    List<Author> findByNationalityIgnoreCase(String nationality);
    
    // Lấy tất cả quốc tịch duy nhất
    @Query("SELECT DISTINCT a.nationality FROM Author a WHERE a.nationality IS NOT NULL ORDER BY a.nationality")
    List<String> findDistinctNationalities();
    
    // Tìm tác giả có sách
    List<Author> findByBooksIsNotEmpty();
    
    // Tìm theo năm sinh
    List<Author> findByBirthDateBetween(LocalDate startDate, LocalDate endDate);
    
    // Kiểm tra tồn tại theo tên
    boolean existsByName(String name);
    
    // Find authors with filters using native query
    @Query("SELECT a FROM Author a WHERE " +
           "(:name IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:nationality IS NULL OR LOWER(a.nationality) LIKE LOWER(CONCAT('%', :nationality, '%')))")
    Page<Author> findAuthorsWithFilters(
        @Param("name") String name, 
        @Param("nationality") String nationality, 
        Pageable pageable
    );
    
    // Count books by author
    @Query("SELECT COUNT(b) FROM Book b WHERE b.author.id = :authorId")
    long countBooksByAuthorId(@Param("authorId") Long authorId);
    
    // Count authors with books
    @Query("SELECT COUNT(DISTINCT a) FROM Author a JOIN a.books b")
    long countAuthorsWithBooks();
}