package com.bookstore.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.Collections;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
@PreAuthorize("hasRole('ADMIN')")
public class FileUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:5MB}")
    private String maxFileSize;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        "jpg", "jpeg", "png", "gif", "webp", "bmp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("=== UPLOAD DEBUG ===");
            System.out.println("File: " + file.getOriginalFilename());
            System.out.println("Size: " + file.getSize());
            System.out.println("Content Type: " + file.getContentType());
            
            Map<String, String> validation = validateFile(file);
            if (!validation.isEmpty()) {
                System.out.println("Validation failed: " + validation);
                return ResponseEntity.badRequest().body(validation);
            }

            System.out.println("Starting local upload...");
            String url = uploadToLocal(file);
            System.out.println("Upload successful. URL: " + url);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("url", url);
            response.put("message", "Tải ảnh lên thành công");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Upload error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Upload failed");
            error.put("message", "Lỗi khi tải ảnh lên: " + e.getMessage());
            error.put("details", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    private String uploadToLocal(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            try {
                Files.createDirectories(uploadPath);
                // Set directory permissions (if running on Linux/Unix)
                if (!System.getProperty("os.name").toLowerCase().contains("windows")) {
                    uploadPath.toFile().setWritable(true, false);
                    uploadPath.toFile().setReadable(true, false);
                    uploadPath.toFile().setExecutable(true, false);
                }
            } catch (IOException e) {
                throw new IOException("Cannot create upload directory: " + e.getMessage());
            }
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            originalFilename = "uploaded_file.png";
        }
        
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < originalFilename.length() - 1) {
            extension = originalFilename.substring(dotIndex);
        } else {
            extension = ".png"; // default extension
        }
        
        String filename = System.currentTimeMillis() + "_" + 
                         originalFilename.replaceAll("[^a-zA-Z0-9.]", "_").replaceAll("__+", "_");

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return URL that matches static resource configuration
        return "http://localhost:8080/uploads/" + filename;
    }

    private Map<String, String> validateFile(MultipartFile file) {
        Map<String, String> errors = new HashMap<>();

        if (file == null || file.isEmpty()) {
            errors.put("file", "File không được để trống");
            return errors;
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            errors.put("filename", "Tên file không hợp lệ");
            return errors;
        }

        // Check file extension
        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            errors.put("extension", "Chỉ chấp nhận file ảnh: " + String.join(", ", ALLOWED_EXTENSIONS));
            return errors;
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            errors.put("size", "Kích thước file không được vượt quá " + (MAX_FILE_SIZE / (1024 * 1024)) + "MB");
            return errors;
        }

        return errors;
    }

    @GetMapping("/image/{filename}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> getImage(@PathVariable String filename) {
        try {
            Path imagePath = Paths.get(uploadDir, filename);
            
            if (!Files.exists(imagePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] imageBytes = Files.readAllBytes(imagePath);
            String contentType = getContentType(filename);

            return ResponseEntity.ok()
                .header("Content-Type", contentType)
                .header("Cache-Control", "max-age=31536000") // 1 year cache
                .body(imageBytes);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private String getContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "webp":
                return "image/webp";
            case "bmp":
                return "image/bmp";
            default:
                return "application/octet-stream";
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("uploadDir", uploadDir);
        health.put("maxFileSize", maxFileSize);
        return ResponseEntity.ok(health);
    }
    
    // ===== NEW ENDPOINTS =====
    
    @GetMapping("/images")
    public ResponseEntity<?> listImages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            List<Map<String, Object>> imageList = new ArrayList<>();
            
            try (var stream = Files.list(uploadPath)) {
                List<Path> files = stream
                    .filter(Files::isRegularFile)
                    .filter(path -> isImageFile(path.getFileName().toString()))
                    .sorted((a, b) -> {
                        try {
                            return Files.getLastModifiedTime(b).compareTo(Files.getLastModifiedTime(a));
                        } catch (IOException e) {
                            return 0;
                        }
                    })
                    .skip((long) page * size)
                    .limit(size)
                    .toList();

                for (Path file : files) {
                    Map<String, Object> imageInfo = new HashMap<>();
                    imageInfo.put("filename", file.getFileName().toString());
                    imageInfo.put("url", "http://localhost:8080/uploads/" + file.getFileName().toString());
                    imageInfo.put("size", Files.size(file));
                    imageInfo.put("lastModified", Files.getLastModifiedTime(file).toString());
                    imageList.add(imageInfo);
                }
            }

            return ResponseEntity.ok(imageList);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to list images");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @DeleteMapping("/images/{filename}")
    public ResponseEntity<?> deleteImage(@PathVariable String filename) {
        try {
            // Validate filename to prevent path traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid filename");
                error.put("message", "Tên file không hợp lệ");
                return ResponseEntity.badRequest().body(error);
            }

            Path imagePath = Paths.get(uploadDir, filename);
            
            if (!Files.exists(imagePath)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File not found");
                error.put("message", "Không tìm thấy file: " + filename);
                return ResponseEntity.notFound().build();
            }

            Files.delete(imagePath);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Đã xóa file thành công: " + filename);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete image");
            error.put("message", "Lỗi khi xóa file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    private boolean isImageFile(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(extension);
    }
} 