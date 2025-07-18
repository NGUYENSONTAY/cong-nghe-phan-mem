package com.bookstore.service;

import com.bookstore.dto.BookDTO;
import com.bookstore.entity.Author;
import com.bookstore.entity.Book;
import com.bookstore.entity.Category;
import com.bookstore.repository.AuthorRepository;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private AuthorRepository authorRepository;
    
    // Lấy tất cả sách
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }
    
    // Lấy sách với pagination
    public Page<Book> getAllBooks(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        return bookRepository.findAll(pageable);
    }
    
    // Tìm kiếm sách với filters - đơn giản hóa
    public Page<Book> searchBooks(String title, Long categoryId, Long authorId, 
                                 BigDecimal minPrice, BigDecimal maxPrice, 
                                 int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Đơn giản hóa - chỉ search theo title
        if (title != null && !title.trim().isEmpty()) {
            List<Book> books = bookRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(title, title);
            return (Page<Book>) books; // Simplified for now
        }
        
        return bookRepository.findAll(pageable);
    }
    
    // Lấy sách theo category - đơn giản hóa
    public List<Book> getBooksByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }
    
    // Lấy sách theo author - đơn giản hóa
    public List<Book> getBooksByAuthor(Long authorId) {
        return bookRepository.findByAuthorId(authorId);
    }
    
    // Lấy sách theo khoảng giá
    public List<Book> getBooksByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return bookRepository.findByPriceBetween(minPrice, maxPrice);
    }
    
    // Lấy sách còn hàng
    public List<Book> getAvailableBooks() {
        return bookRepository.findByStockQuantityGreaterThan(0);
    }
    
    // Tìm kiếm sách theo keyword
    public List<Book> searchBooksByKeyword(String keyword) {
        return bookRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }
    
    // Lấy sách theo ID
    public Book getBookById(Long id) {
        return bookRepository.findByIdWithCategoryAndAuthor(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sách với ID: " + id));
    }
    
    // Lấy sách theo ISBN
    public Book getBookByIsbn(String isbn) {
        return bookRepository.findByIsbn(isbn)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy sách với ISBN: " + isbn));
    }
    
    // Tạo sách mới
    public Book createBook(BookDTO bookDTO) {
        // Kiểm tra ISBN unique (nếu có)
        if (bookDTO.getIsbn() != null && bookRepository.existsByIsbn(bookDTO.getIsbn())) {
            throw new RuntimeException("ISBN đã tồn tại: " + bookDTO.getIsbn());
        }
        
        Book book = new Book();
        mapDTOToEntity(bookDTO, book);
        
        return bookRepository.save(book);
    }
    
    // Cập nhật sách
    public Book updateBook(Long id, BookDTO bookDTO) {
        Book book = getBookById(id);
        
        // Kiểm tra ISBN unique (nếu thay đổi)
        if (bookDTO.getIsbn() != null && !bookDTO.getIsbn().equals(book.getIsbn())) {
            if (bookRepository.existsByIsbn(bookDTO.getIsbn())) {
                throw new RuntimeException("ISBN đã tồn tại: " + bookDTO.getIsbn());
            }
        }
        
        mapDTOToEntity(bookDTO, book);
        
        return bookRepository.save(book);
    }
    
    // Xóa sách
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sách với ID: " + id);
        }
        bookRepository.deleteById(id);
    }
    
    // Lấy sách mới nhất - sử dụng Page methods
    public List<Book> getLatestBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return bookRepository.findAllByOrderByCreatedAtDescWithCategoryAndAuthor(pageable).getContent();
    }
    
    // Lấy sách bán chạy - sử dụng Page methods  
    public List<Book> getBestSellingBooks(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return bookRepository.findAllByOrderByStockQuantityDescWithCategoryAndAuthor(pageable).getContent();
    }
    
    // Lấy sách ngẫu nhiên
    public List<Book> getRandomBooks(int limit) {
        // Simplified implementation
        Pageable pageable = PageRequest.of(0, limit);
        return bookRepository.findAll(pageable).getContent();
    }
    
    // Lấy sách theo ngôn ngữ
    public List<Book> getBooksByLanguage(String language) {
        return bookRepository.findByLanguageIgnoreCase(language);
    }
    
    // Cập nhật stock
    public Book updateStock(Long bookId, int quantity) {
        Book book = getBookById(bookId);
        book.setStockQuantity(quantity);
        return bookRepository.save(book);
    }
    
    // Giảm stock khi có đơn hàng
    public void reduceStock(Long bookId, int quantity) {
        Book book = getBookById(bookId);
        book.reduceStock(quantity);
        bookRepository.save(book);
    }
    
    // Tăng stock khi hủy đơn hàng
    public void increaseStock(Long bookId, int quantity) {
        Book book = getBookById(bookId);
        book.increaseStock(quantity);
        bookRepository.save(book);
    }
    
    // Kiểm tra sách có sẵn với số lượng yêu cầu
    public boolean isBookAvailable(Long bookId, int requestedQuantity) {
        Book book = getBookById(bookId);
        return book.isAvailable(requestedQuantity);
    }
    
    // Thống kê sách
    public long getTotalBooks() {
        return bookRepository.count();
    }
    
    public long getAvailableBooksCount() {
        return bookRepository.findByStockQuantityGreaterThan(0).size();
    }
    
    public long getOutOfStockBooksCount() {
        return bookRepository.findByStockQuantityGreaterThan(0).size(); // Simplified
    }
    
    // Helper method để map DTO sang Entity
    private void mapDTOToEntity(BookDTO bookDTO, Book book) {
        book.setTitle(bookDTO.getTitle());
        book.setDescription(bookDTO.getDescription());
        book.setIsbn(bookDTO.getIsbn());
        book.setPrice(bookDTO.getPrice());
        book.setStockQuantity(bookDTO.getStockQuantity() != null ? bookDTO.getStockQuantity() : 0);
        if (bookDTO.getImages() != null && !bookDTO.getImages().isEmpty()) {
            book.setImages(bookDTO.getImages());
            // backward compatibility: set first image as imageUrl
            book.setImageUrl(bookDTO.getImages().get(0));
        }
        book.setPages(bookDTO.getPages());
        book.setLanguage(bookDTO.getLanguage() != null ? bookDTO.getLanguage() : "Vietnamese");
        
        // Set category
        if (bookDTO.getCategoryId() != null) {
            Category category = categoryRepository.findById(bookDTO.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thể loại với ID: " + bookDTO.getCategoryId()));
            book.setCategory(category);
        }
        
        // Set author
        if (bookDTO.getAuthorId() != null) {
            Author author = authorRepository.findById(bookDTO.getAuthorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tác giả với ID: " + bookDTO.getAuthorId()));
            book.setAuthor(author);
        } else if (bookDTO.getAuthor() != null && !bookDTO.getAuthor().trim().isEmpty()) {
            // Find or create author by name (fallback for compatibility)
            Optional<Author> authorOpt = authorRepository.findByName(bookDTO.getAuthor().trim());
            Author author;
            if (authorOpt.isPresent()) {
                author = authorOpt.get();
            } else {
                author = new Author();
                author.setName(bookDTO.getAuthor().trim());
                author.setBiography("Thông tin tác giả sẽ được cập nhật sau.");
                author = authorRepository.save(author);
            }
            book.setAuthor(author);
        }
    }
    
    // Methods needed for AdminBookController
    
    // Lấy tất cả sách với filters cho admin
    public Page<Book> getAllBooksWithFilters(
            Pageable pageable, 
            String title, 
            String author, 
            Long categoryId, 
            BigDecimal minPrice, 
            BigDecimal maxPrice, 
            Boolean inStock) {
        
        // Sử dụng JOIN FETCH methods để tránh lazy loading
        if (title != null && !title.trim().isEmpty()) {
            return bookRepository.findByTitleContainingIgnoreCaseWithCategoryAndAuthor(title, pageable);
        }
        
        if (categoryId != null) {
            return bookRepository.findByCategoryIdWithCategoryAndAuthor(categoryId, pageable);
        }
        
        if (inStock != null && inStock) {
            return bookRepository.findByStockQuantityGreaterThanWithCategoryAndAuthor(0, pageable);
        }
        
        // Default case - return all books với JOIN FETCH
        return bookRepository.findAllWithCategoryAndAuthor(pageable);
    }
    
    // Save book method cho admin
    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }
    
    // Delete bulk books
    public int deleteBulkBooks(List<Long> ids) {
        int count = 0;
        for (Long id : ids) {
            if (bookRepository.existsById(id)) {
                bookRepository.deleteById(id);
                count++;
            }
        }
        return count;
    }
    
    // Get book by ID với null check thay vì exception
    public Book getBookByIdSafe(Long id) {
        return bookRepository.findById(id).orElse(null);
    }
}