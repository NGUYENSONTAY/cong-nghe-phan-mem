package com.bookstore.service;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    // Lấy tất cả users với pagination
    public Page<User> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable);
    }
    
    // Lấy user theo ID
    public User getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy user với ID: " + id));
    }
    
    // Lấy user theo email
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy user với email: " + email));
    }
    
    // Lấy user theo username
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy user với username: " + username));
    }
    
    // Tìm kiếm users theo email hoặc username
    public List<User> searchUsers(String keyword) {
        return userRepository.findByEmailContainingIgnoreCaseOrUsernameContainingIgnoreCase(keyword, keyword);
    }
    
    // Cập nhật user (admin)
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        
        // Kiểm tra email unique (nếu thay đổi)
        if (!userDetails.getEmail().equals(user.getEmail()) && 
            userRepository.existsByEmail(userDetails.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng: " + userDetails.getEmail());
        }
        
        // Kiểm tra username unique (nếu thay đổi)
        if (!userDetails.getUsername().equals(user.getUsername()) && 
            userRepository.existsByUsername(userDetails.getUsername())) {
            throw new RuntimeException("Username đã được sử dụng: " + userDetails.getUsername());
        }
        
        // Cập nhật thông tin
        user.setEmail(userDetails.getEmail());
        user.setUsername(userDetails.getUsername());
        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setPhone(userDetails.getPhone());
        user.setAddress(userDetails.getAddress());
        user.setRole(userDetails.getRole());
        
        return userRepository.save(user);
    }
    
    // Cập nhật role user
    public User updateUserRole(Long id, Role newRole) {
        User user = getUserById(id);
        user.setRole(newRole);
        return userRepository.save(user);
    }
    
    // Cập nhật password user
    public User updateUserPassword(Long id, String newPassword) {
        User user = getUserById(id);
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }
    
    // Xóa user (admin) - soft delete hoặc hard delete
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy user với ID: " + id);
        }
        
        // Kiểm tra có đơn hàng nào liên quan không bằng cách count
        long orderCount = userRepository.countOrdersByUserId(id);
        if (orderCount > 0) {
            throw new RuntimeException("Không thể xóa user vì có " + orderCount + " đơn hàng liên quan");
        }
        
        userRepository.deleteById(id);
    }
    
    // Lấy users theo role
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
    
    // Đếm số users
    public long getTotalUsersCount() {
        return userRepository.count();
    }
    
    public long getCustomersCount() {
        return userRepository.countByRole(Role.CUSTOMER);
    }
    
    public long getAdminsCount() {
        return userRepository.countByRole(Role.ADMIN);
    }
    
    // Kiểm tra email có sẵn
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }
    
    // Kiểm tra username có sẵn
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }
    
    // Kích hoạt/vô hiệu hóa user
    public User toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setEnabled(!user.isEnabled());
        return userRepository.save(user);
    }
    
    // Get all users with filters for admin
    public Page<User> getAllUsersWithFilters(
            Pageable pageable, 
            String username, 
            String email, 
            String role, 
            Boolean enabled
    ) {
        if (username != null || email != null || role != null || enabled != null) {
            return userRepository.findUsersWithFilters(username, email, role, enabled, pageable);
        }
        return userRepository.findAll(pageable);
    }
    
    // Update user (simplified version)
    public User updateUser(User user) {
        return userRepository.save(user);
    }
    
    // Change user role
    public User changeUserRole(Long id, String roleName) {
        User user = getUserById(id);
        Role role = Role.valueOf(roleName.toUpperCase());
        user.setRole(role);
        return userRepository.save(user);
    }
    
    // Get statistics
    public long getTotalUsers() {
        return userRepository.count();
    }
    
    public long getActiveUsersCount() {
        return userRepository.countByEnabled(true);
    }
    
    // Bulk delete users
    public void bulkDeleteUsers(List<Long> userIds) {
        userRepository.deleteAllById(userIds);
    }
}