
---

# **Thiên Nguyệt Động Phủ – Trận Pháp Quản Lý Tiên Gia**  

## **Đại Cương**  
**Thiên Nguyệt Động Phủ** là một đại pháp quản lý tiên phủ, chuyên dụng cho các môn phái và gia tộc tiên gia. Pháp bảo này hỗ trợ chưởng môn và các vị trưởng lão quản lý hộ tịch, giám sát linh phí, và kiểm soát quá trình thu nạp linh thạch. Nhờ vào nó, tiên gia có thể dễ dàng vận hành linh trận tài chính, tra xét sổ sách và kiểm soát tình hình thu nạp linh thạch trong động phủ.  

## **Đặc Tính**  
🔹 **Tổng Quan Đại Trận:** Hiển thị trạng thái tu hành cùng những biến động quan trọng trong động phủ.  
🔹 **Quản Lý Hộ Tịch:** Ghi danh các tiên nhân trong động phủ, theo dõi tình trạng sinh hoạt.  
🔹 **Quản Lý Linh Phí:** Tạo, sửa đổi, và duy trì các loại linh phí (bắt buộc/tùy chọn).  
🔹 **Kiểm Soát Linh Thạch:** Ghi nhận, xác minh quá trình thu nạp linh thạch, lưu trữ lịch sử giao dịch.  
🔹 **Bảo Vệ Tiên Gia:** Thiết lập cơ chế xác thực thân phận dựa trên tiên ấn và trận pháp bảo hộ (JWT).  
🔹 **Thống Kê & Báo Cáo:** Hiển thị trực quan tình hình thu nạp linh thạch và biến động kinh tế trong tiên phủ.  
🔹 **Thiết Kế Linh Hoạt:** Hỗ trợ từ thiên giới đến nhân gian, hoạt động ổn định trên nhiều pháp khí khác nhau.  

---

## **Trận Pháp Công Nghệ**  
### **Mặt Trận Trước (Tiên Ấn Trận Pháp)**  
- **React.js** với linh kiện **Material UI**, giúp tăng cường trực quan.  
- **Recharts**, một pháp bảo giúp hiển thị số liệu thu nạp linh thạch.  
- **React Router**, để dẫn dắt các tiên nhân trong giao diện trận pháp.  
- **Axios**, kết nối với hậu phương nhằm truy xuất dữ liệu linh hoạt.  

### **Mặt Trận Sau (Hậu Trận Thánh Địa)**  
- **Java với Spring Boot**, vững chắc như một thiên đạo tu luyện.  
- **Spring Security** kết hợp **JWT**, bảo hộ động phủ khỏi tà ma ngoại đạo.  
- **JPA/Hibernate**, vận hành hệ thống lưu trữ hộ tịch một cách trật tự.  
- **MySQL**, linh thạch nền tảng của toàn bộ bảo pháp này.  

---

## **Trận Pháp Kết Cấu**  

### **Mặt Trận Trước – Tiên Ấn Trận**  
```
frontend/
├── public/              # Khu vực tài nguyên công khai
├── src/
│   ├── components/      # Linh kiện chính của trận pháp
│   │   ├── common/      # Linh kiện dùng chung
│   │   ├── dashboard/   # Linh kiện tổng quản
│   │   ├── fee/         # Linh kiện quản lý linh phí
│   │   ├── household/   # Linh kiện quản lý hộ tịch
│   │   ├── payment/     # Linh kiện kiểm soát linh thạch
│   │   └── statistics/  # Linh kiện thống kê
│   ├── services/        # Kết nối với hậu phương
│   ├── utils/           # Trợ pháp hỗ trợ
│   ├── config/          # Cấu hình trận pháp
│   ├── App.js           # Linh kiện chính
│   └── index.js         # Điểm khởi đầu của đại trận
└── package.json         # Danh sách bảo pháp phụ trợ
```

### **Hậu Trận – Thiên Cơ Bảo Địa**  
```
backend/
├── src/main/java/com/bluemoon/fees/
│   ├── config/          # Trận pháp bảo hộ và cấu hình
│   ├── controller/      # Kết nối giữa tiên nhân và hệ thống
│   ├── dto/             # Thư tín trao đổi linh lực
│   ├── entity/          # Cấu trúc hộ tịch và linh thạch
│   ├── repository/      # Kho tàng lưu trữ pháp quyết
│   ├── security/        # Phòng thủ động phủ
│   ├── service/         # Pháp quyết quản lý
│   │   └── impl/        # Triển khai chân ngôn
│   └── Application.java # Điểm khởi nguồn trận pháp
└── pom.xml              # Lời thệ nguyện bảo pháp
```

---

## **Thiên Đạo Cài Đặt**  

### **Tiền Đề Cần Có**  
- Node.js (v14 hoặc cao hơn)  
- Java Development Kit (JDK) 17  
- MySQL 8.0  

### **Khai Mở Đại Trận**  

#### **Thiết Lập Hậu Trận**  
1. Triệu hồi đại pháp:  
   ```
   git clone https://github.com/yourusername/cowm.git
   cd cowm
   ```
2. Cấu hình linh lực:  
   ```
   spring.datasource.url=jdbc:mysql://localhost:3306/bluemoon_fees
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```
3. Khai mở trận pháp:  
   ```
   cd backend
   ./mvnw spring-boot:run
   ```
   **Hậu trận khởi động tại**: `http://localhost:8080`  

#### **Triển Khai Tiền Tuyến**  
1. Kêu gọi linh kiện hỗ trợ:  
   ```
   cd frontend
   npm install
   ```
2. Triệu hồi tiền tuyến:  
   ```
   npm run dev
   ```
   **Tiền tuyến vận hành tại**: `http://localhost:3000`  

---

## **Cách Sử Dụng**  
1. **Khai mở tiên môn** với tài khoản mặc định:  
   - **Chưởng môn**: `admin`  
   - **Mật mã**: `admin123`  

2. **Các bảo điện quản lý**:  
   - **Tổng Quản Điện**: Nắm giữ toàn bộ tiên phủ  
   - **Hộ Tịch Đường**: Quản lý cư dân tiên môn  
   - **Linh Phí Đài**: Định ra và giám sát linh phí  
   - **Linh Thạch Các**: Theo dõi việc thu nạp linh thạch  
   - **Tiên Cơ Điện**: Phân tích tình hình tài chính  

---

## **Thiên Cơ Pháp Quyết – API Chi Đạo**  

### **Chứng Nhận Thân Phận**  
- `POST /api/auth/login` - Đạo hữu nhập môn  
- `POST /api/auth/register` - Tân tu sĩ đăng ký  

### **Hộ Tịch Chi Đạo**  
- `GET /api/households` - Truy vấn tất cả hộ tịch  
- `POST /api/households` - Tạo mới hộ tịch  

### **Linh Phí Chi Đạo**  
- `GET /api/fees` - Truy vấn tất cả linh phí  
- `POST /api/fees` - Tạo mới linh phí  

### **Linh Thạch Chi Đạo**  
- `GET /api/payments` - Xem tất cả giao dịch  
- `POST /api/payments` - Thêm mới giao dịch  

---

Nếu đạo hữu có gì chưa thông suốt, cứ truyền âm, bần đạo sẽ tiếp tục tinh chỉnh bảo pháp này! ✨