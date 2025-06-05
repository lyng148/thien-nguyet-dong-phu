# Hướng dẫn cập nhật cơ sở dữ liệu

## Cập nhật cấu trúc bảng utility_payment

Để cho phép trường `utility_service_id` có thể nhận giá trị null, chạy câu lệnh SQL sau trong MySQL:

```sql
ALTER TABLE utility_payment MODIFY COLUMN utility_service_id BIGINT NULL;
```

## Hoặc sử dụng script migration

Nếu bạn sử dụng Flyway, chạy lệnh sau để áp dụng migration:

```bash
./mvnw flyway:migrate
```

## Giải pháp tạm thời trong code

Trong trường hợp không thể sửa cấu trúc cơ sở dữ liệu ngay lập tức, code đã được cập nhật để luôn sử dụng giá trị mặc định (1) cho `utility_service_id` khi không có giá trị được cung cấp.
