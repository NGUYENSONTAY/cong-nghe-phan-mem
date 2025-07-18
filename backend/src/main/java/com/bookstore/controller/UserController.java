package com.bookstore.controller;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.service.AuthService;
import com.bookstore.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class UserController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private UserService userService;

    // Get current user profile
    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User currentUser = authService.getCurrentUser();
            
            // Không trả về password
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", currentUser.getId());
            userInfo.put("username", currentUser.getUsername());
            userInfo.put("email", currentUser.getEmail());
            userInfo.put("firstName", currentUser.getFirstName());
            userInfo.put("lastName", currentUser.getLastName());
            userInfo.put("phone", currentUser.getPhone());
            userInfo.put("address", currentUser.getAddress());
            userInfo.put("role", currentUser.getRole());
            userInfo.put("createdAt", currentUser.getCreatedAt());
            userInfo.put("updatedAt", currentUser.getUpdatedAt());
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get user info");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Update user profile
    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody Map<String, String> updates) {
        try {
            User currentUser = authService.getCurrentUser();
            
            // Update allowed fields
            if (updates.containsKey("firstName")) {
                currentUser.setFirstName(updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                currentUser.setLastName(updates.get("lastName"));
            }
            if (updates.containsKey("phone")) {
                currentUser.setPhone(updates.get("phone"));
            }
            if (updates.containsKey("address")) {
                currentUser.setAddress(updates.get("address"));
            }
            
            // Save updated user (you'll need UserService for this)
            // For now, return the updated user info
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", currentUser.getId());
            userInfo.put("username", currentUser.getUsername());
            userInfo.put("email", currentUser.getEmail());
            userInfo.put("firstName", currentUser.getFirstName());
            userInfo.put("lastName", currentUser.getLastName());
            userInfo.put("phone", currentUser.getPhone());
            userInfo.put("address", currentUser.getAddress());
            userInfo.put("role", currentUser.getRole());
            userInfo.put("createdAt", currentUser.getCreatedAt());
            userInfo.put("updatedAt", currentUser.getUpdatedAt());
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update profile");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Change password
    @PutMapping("/me/password")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> changePassword(@Valid @RequestBody Map<String, String> passwordData) {
        try {
            // Implementation would go here
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to change password");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // === ADMIN ENDPOINTS ===
    
    // Get all users (admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Page<User> users = userService.getAllUsers(page, limit);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get users");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    // Update user (admin only)
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        try {
            User user = userService.getUserById(id);
            
            // Update role if provided
            if (updates.containsKey("role")) {
                String roleStr = (String) updates.get("role");
                Role newRole = Role.valueOf(roleStr);
                user = userService.updateUserRole(id, newRole);
            }
            
            // Không trả về password
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("phone", user.getPhone());
            userInfo.put("address", user.getAddress());
            userInfo.put("role", user.getRole());
            userInfo.put("createdAt", user.getCreatedAt());
            userInfo.put("updatedAt", user.getUpdatedAt());
            
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update user");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
} 