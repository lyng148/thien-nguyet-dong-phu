-- Create vehicle table
CREATE TABLE IF NOT EXISTS vehicle (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    bien_so_xe VARCHAR(20) NOT NULL UNIQUE,
    loai_xe VARCHAR(20) NOT NULL, -- XE_MAY, OTO
    hang_xe VARCHAR(100),
    mau_xe VARCHAR(100),
    nam_san_xuat INT,
    mau_sac VARCHAR(50),
    ghi_chu TEXT,
    ho_khau_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ho_khau_id) REFERENCES ho_khau(id) ON DELETE CASCADE,
    INDEX idx_vehicle_ho_khau_id (ho_khau_id),
    INDEX idx_vehicle_bien_so_xe (bien_so_xe),
    INDEX idx_vehicle_loai_xe (loai_xe)
);

-- Add some sample data
INSERT IGNORE INTO vehicle (bien_so_xe, loai_xe, hang_xe, mau_xe, nam_san_xuat, mau_sac, ho_khau_id, ghi_chu) VALUES
('30A-12345', 'XE_MAY', 'Honda', 'Wave Alpha', 2020, 'Đỏ', 1, 'Xe máy Honda Wave Alpha màu đỏ'),
('30B-67890', 'OTO', 'Toyota', 'Vios', 2019, 'Trắng', 1, 'Ô tô Toyota Vios màu trắng'),
('29A-11111', 'XE_MAY', 'Yamaha', 'Exciter', 2021, 'Xanh', 2, 'Xe máy Yamaha Exciter màu xanh'),
('30C-22222', 'OTO', 'Honda', 'Civic', 2022, 'Đen', 3, 'Ô tô Honda Civic màu đen'),
('31A-33333', 'XE_MAY', 'SYM', 'Shark', 2020, 'Đỏ', 4, 'Xe máy SYM Shark màu đỏ');
