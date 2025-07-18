package com.bookstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BookstoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookstoreApplication.class, args);
        System.out.println("🚀 Bookstore API đã khởi động thành công!");
        System.out.println("📚 Truy cập API tại: http://localhost:8080");
        System.out.println("📋 Health check: http://localhost:8080/actuator/health");
    }
} 