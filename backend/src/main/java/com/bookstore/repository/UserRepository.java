package com.bookstore.repository;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    Optional<User> findByUsername(String username);
    
    boolean existsByEmail(String email);
    
    boolean existsByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE u.email = ?1 OR u.username = ?1")
    Optional<User> findByEmailOrUsername(String emailOrUsername);
    
    // Tìm kiếm users theo email hoặc username
    List<User> findByEmailContainingIgnoreCaseOrUsernameContainingIgnoreCase(String email, String username);
    
    // Lấy users theo role
    List<User> findByRole(Role role);
    
    // Đếm users theo role
    long countByRole(Role role);
    
    // Count users by enabled status
    long countByEnabled(boolean enabled);
    
    // Find users with filters using native query
    @Query("SELECT u FROM User u WHERE " +
           "(:username IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND " +
           "(:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:enabled IS NULL OR u.enabled = :enabled)")
    Page<User> findUsersWithFilters(
        @Param("username") String username, 
        @Param("email") String email, 
        @Param("role") String role, 
        @Param("enabled") Boolean enabled, 
        Pageable pageable
    );
    
    // Count orders by user ID để tránh lazy loading
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId")
    long countOrdersByUserId(@Param("userId") Long userId);
}