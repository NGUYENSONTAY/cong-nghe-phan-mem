package com.bookstore.config;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @EventListener
    public void seed(ApplicationReadyEvent event) {
        if (shouldSeedData()) {
            seedUsers();
            seedCategories();
            seedAuthors();
            seedBooks();
            System.out.println("✅ Dữ liệu mẫu đã được tạo thành công!");
        } else {
            System.out.println("ℹ️ Dữ liệu đã tồn tại, bỏ qua việc tạo dữ liệu mẫu.");
        }
    }

    private boolean shouldSeedData() {
        return userRepository.count() == 0 && categoryRepository.count() == 0;
    }

    private void seedUsers() {
        // Tạo admin user
        User admin = new User();
        admin.setEmail("admin@bookstore.com");
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPhone("0901234567");
        admin.setAddress("123 Admin Street, Ho Chi Minh City");
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        // Tạo customer users
        User customer1 = new User();
        customer1.setEmail("customer1@example.com");
        customer1.setUsername("customer1");
        customer1.setPassword(passwordEncoder.encode("password123"));
        customer1.setFirstName("Nguyễn");
        customer1.setLastName("Văn A");
        customer1.setPhone("0987654321");
        customer1.setAddress("456 Nguyen Trai, District 1, Ho Chi Minh City");
        customer1.setRole(Role.CUSTOMER);
        userRepository.save(customer1);

        User customer2 = new User();
        customer2.setEmail("customer2@example.com");
        customer2.setUsername("customer2");
        customer2.setPassword(passwordEncoder.encode("password123"));
        customer2.setFirstName("Trần");
        customer2.setLastName("Thị B");
        customer2.setPhone("0976543210");
        customer2.setAddress("789 Le Loi, District 3, Ho Chi Minh City");
        customer2.setRole(Role.CUSTOMER);
        userRepository.save(customer2);

        System.out.println("🧑‍💼 Đã tạo users: admin, customer1, customer2");
    }

    private void seedCategories() {
        String[] categoryData = {
            "Văn học,Sách văn học trong và ngoài nước",
            "Khoa học,Sách về khoa học và công nghệ",
            "Lịch sử,Sách lịch sử và văn hóa",
            "Kinh tế,Sách về kinh tế và quản lý",
            "Công nghệ,Sách về lập trình và IT",
            "Tâm lý,Sách về tâm lý học và phát triển bản thân",
            "Thiếu nhi,Sách dành cho trẻ em",
            "Tiểu thuyết,Tiểu thuyết và truyện ngắn",
            "Triết học,Sách triết học và tư duy",
            "Ngoại ngữ,Sách học ngoại ngữ"
        };

        for (String data : categoryData) {
            String[] parts = data.split(",");
            Category category = new Category();
            category.setName(parts[0]);
            category.setDescription(parts[1]);
            categoryRepository.save(category);
        }

        System.out.println("📚 Đã tạo " + categoryData.length + " thể loại sách");
    }

    private void seedAuthors() {
        Object[][] authorData = {
            {"Nguyễn Du", "Đại thi hào Việt Nam, tác giả Truyện Kiều", LocalDate.of(1766, 1, 3), "Việt Nam"},
            {"Hồ Chí Minh", "Chủ tịch Hồ Chí Minh, lãnh tụ dân tộc Việt Nam", LocalDate.of(1890, 5, 19), "Việt Nam"},
            {"Paulo Coelho", "Nhà văn Brazil nổi tiếng thế giới", LocalDate.of(1947, 8, 24), "Brazil"},
            {"Haruki Murakami", "Tiểu thuyết gia Nhật Bản đương đại", LocalDate.of(1949, 1, 12), "Nhật Bản"},
            {"J.K. Rowling", "Tác giả series Harry Potter", LocalDate.of(1965, 7, 31), "Anh"},
            {"Robert T. Kiyosaki", "Tác giả sách về tài chính cá nhân", LocalDate.of(1947, 4, 8), "Mỹ"},
            {"Dale Carnegie", "Tác giả sách về kỹ năng sống", LocalDate.of(1888, 11, 24), "Mỹ"},
            {"Yuval Noah Harari", "Sử gia và nhà văn Israel", LocalDate.of(1976, 2, 24), "Israel"},
            {"Tô Hoài", "Nhà văn Việt Nam, tác giả Dế Mèn phiêu lưu ký", LocalDate.of(1920, 9, 27), "Việt Nam"},
            {"Nam Cao", "Nhà văn hiện thực Việt Nam", LocalDate.of(1915, 10, 29), "Việt Nam"}
        };

        for (Object[] data : authorData) {
            Author author = new Author();
            author.setName((String) data[0]);
            author.setBiography((String) data[1]);
            author.setBirthDate((LocalDate) data[2]);
            author.setNationality((String) data[3]);
            authorRepository.save(author);
        }

        System.out.println("✍️ Đã tạo " + authorData.length + " tác giả");
    }

    private void seedBooks() {
        // Lấy categories và authors
        Category vanHoc = categoryRepository.findByName("Văn học").orElse(null);
        Category kinhTe = categoryRepository.findByName("Kinh tế").orElse(null);
        Category congNghe = categoryRepository.findByName("Công nghệ").orElse(null);
        Category tamLy = categoryRepository.findByName("Tâm lý").orElse(null);
        Category tieuThuyet = categoryRepository.findByName("Tiểu thuyết").orElse(null);
        Category lichSu = categoryRepository.findByName("Lịch sử").orElse(null);

        Author nguyenDu = authorRepository.findByNameContainingIgnoreCase("Nguyễn Du").get(0);
        Author hoChiMinh = authorRepository.findByNameContainingIgnoreCase("Hồ Chí Minh").get(0);
        Author paulo = authorRepository.findByNameContainingIgnoreCase("Paulo Coelho").get(0);
        Author murakami = authorRepository.findByNameContainingIgnoreCase("Haruki Murakami").get(0);
        Author kiyosaki = authorRepository.findByNameContainingIgnoreCase("Robert T. Kiyosaki").get(0);
        Author carnegie = authorRepository.findByNameContainingIgnoreCase("Dale Carnegie").get(0);
        Author harari = authorRepository.findByNameContainingIgnoreCase("Yuval Noah Harari").get(0);

        Object[][] bookData = {
            {"Truyện Kiều", "Tác phẩm kinh điển của văn học Việt Nam", "978-604-2-123456", new BigDecimal("120000"), 50, "https://www.nxbtre.com.vn/Images/Book/NXBTreStoryFull_03462015_104616.jpg", 400, "Vietnamese", vanHoc, nguyenDu},
            {"Nhật ký trong tù", "Tập thơ của Chủ tịch Hồ Chí Minh", "978-604-2-123457", new BigDecimal("85000"), 30, "https://file3.qdnd.vn/data/images/0/2023/05/12/hoanghoang/a.jpg", 200, "Vietnamese", vanHoc, hoChiMinh},
            {"Nhà giả kim", "Câu chuyện về hành trình tìm kiếm ước mơ", "978-604-2-123458", new BigDecimal("95000"), 100, "https://upload.wikimedia.org/wikipedia/vi/9/9c/Nh%C3%A0_gi%E1%BA%A3_kim_%28s%C3%A1ch%29.jpg", 320, "Vietnamese", tieuThuyet, paulo},
            {"Rừng Na-uy", "Tiểu thuyết nổi tiếng của Haruki Murakami", "978-604-2-123459", new BigDecimal("150000"), 75, "https://nxbhoinhavan.vn//upload/img_nxb/img_sp_nxb/rung_na_uy.webp", 480, "Vietnamese", tieuThuyet, murakami},
            {"Kafka bên bờ biển", "Tác phẩm đặc sắc của Murakami", "978-604-2-123460", new BigDecimal("180000"), 60, "https://upload.wikimedia.org/wikipedia/vi/5/5b/Kafka_b%C3%AAn_b%E1%BB%9D_bi%E1%BB%83n.JPG", 520, "Vietnamese", tieuThuyet, murakami},
            {"Cha giàu Cha nghèo", "Sách về tài chính cá nhân", "978-604-2-123461", new BigDecimal("110000"), 80, "https://taimienphisach.com/wp-content/uploads/2024/08/1162-cha-giau-cha-ngheo-1.jpg", 360, "Vietnamese", kinhTe, kiyosaki},
            {"Đắc nhân tâm", "Sách về kỹ năng giao tiếp", "978-604-2-123462", new BigDecimal("89000"), 120, "https://nhasachphuongnam.com/images/detailed/217/dac-nhan-tam-bc.jpg", 280, "Vietnamese", tamLy, carnegie},
            {"Sapiens: Lược sử loài người", "Câu chuyện về sự tiến hóa của loài người", "978-604-2-123463", new BigDecimal("220000"), 45, "https://bizweb.dktcdn.net/100/197/269/products/sapiens-luoc-su-ve-loai-nguoi-outline-5-7-2017-02.jpg?v=1520935327270", 600, "Vietnamese", lichSu, harari},
            {"21 bài học cho thế kỷ 21", "Những thách thức của thế kỷ 21", "978-604-2-123464", new BigDecimal("195000"), 55, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMIuhAaAI2oyXwBCeYm6VXHxUMhbJeuwSu2g&s", 450, "Vietnamese", lichSu, harari},
            {"Homo Deus", "Tương lai của loài người", "978-604-2-123465", new BigDecimal("210000"), 40, "https://bizweb.dktcdn.net/thumb/grande/100/326/228/products/homo-deus-by-yuval-noah-harari-bookworm-hanoi-b1ffd05a-fcc7-4ed5-a572-4a9182d902d6.jpg?v=1577764820697", 520, "Vietnamese", lichSu, harari}
        };

        for (Object[] data : bookData) {
            Book book = new Book();
            book.setTitle((String) data[0]);
            book.setDescription((String) data[1]);
            book.setIsbn((String) data[2]);
            book.setPrice((BigDecimal) data[3]);
            book.setStockQuantity((Integer) data[4]);
            book.setImageUrl((String) data[5]);
            book.setPages((Integer) data[6]);
            book.setLanguage((String) data[7]);
            book.setCategory((Category) data[8]);
            book.setAuthor((Author) data[9]);
            bookRepository.save(book);
        }

        System.out.println("📖 Đã tạo " + bookData.length + " cuốn sách");
    }
} 