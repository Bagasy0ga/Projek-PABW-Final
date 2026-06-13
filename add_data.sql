-- ===================================
-- ADD ADDITIONAL ROOMS FOR HOTELS 4-8
-- ===================================

-- Additional rooms for Hotel 4 (Lombok)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(4, 1, 'L104', 430000.00, 'available'),
(4, 1, 'L105', 430000.00, 'available'),
(4, 2, 'L204', 600000.00, 'available'),
(4, 2, 'L205', 600000.00, 'available'),
(4, 3, 'L304', 650000.00, 'available'),
(4, 4, 'L404', 900000.00, 'available'),
(4, 5, 'L504', 860000.00, 'available'),
(4, 6, 'L604', 1380000.00, 'available');

-- Additional rooms for Hotel 5 (Bali/Kuta)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(5, 1, 'K510', 475000.00, 'available'),
(5, 1, 'K511', 475000.00, 'available'),
(5, 2, 'K509', 625000.00, 'available'),
(5, 3, 'K510', 675000.00, 'available'),
(5, 4, 'K511', 930000.00, 'available'),
(5, 5, 'K510', 880000.00, 'available'),
(5, 6, 'K511', 1425000.00, 'available');

-- Additional rooms for Hotel 6 (Bandung)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(6, 1, 'B608', 395000.00, 'available'),
(6, 1, 'B609', 395000.00, 'available'),
(6, 2, 'B608', 550000.00, 'available'),
(6, 3, 'B608', 605000.00, 'available'),
(6, 4, 'B605', 855000.00, 'available'),
(6, 5, 'B606', 805000.00, 'available'),
(6, 6, 'B607', 1305000.00, 'available');

-- Additional rooms for Hotel 7 (Jakarta - Kota Tua)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(7, 1, 'H704', 440000.00, 'available'),
(7, 2, 'H705', 600000.00, 'available'),
(7, 3, 'H706', 655000.00, 'available'),
(7, 4, 'H707', 905000.00, 'available'),
(7, 5, 'H708', 855000.00, 'available'),
(7, 6, 'H709', 1380000.00, 'available');

-- Add rooms for Hotel 8 (Medan)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(8, 1, 'M104', 405000.00, 'available'),
(8, 1, 'M105', 405000.00, 'available'),
(8, 2, 'M204', 565000.00, 'available'),
(8, 2, 'M205', 565000.00, 'available'),
(8, 3, 'M304', 630000.00, 'available'),
(8, 3, 'M305', 630000.00, 'available'),
(8, 4, 'M404', 880000.00, 'available'),
(8, 5, 'M504', 820000.00, 'available'),
(8, 5, 'M505', 820000.00, 'available'),
(8, 6, 'M604', 1340000.00, 'available');

-- ===================================
-- ADD ROOMS FOR NEW HOTELS (9-14)
-- ===================================

-- Rooms for Hotel 9 (Yogyakarta - Rajawali Jogja Palace)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(9, 1, 'Y101', 410000.00, 'available'),
(9, 1, 'Y102', 410000.00, 'available'),
(9, 1, 'Y103', 410000.00, 'available'),
(9, 2, 'Y201', 560000.00, 'available'),
(9, 2, 'Y202', 560000.00, 'available'),
(9, 3, 'Y301', 620000.00, 'available'),
(9, 3, 'Y302', 620000.00, 'available'),
(9, 4, 'Y401', 870000.00, 'available'),
(9, 4, 'Y402', 870000.00, 'available'),
(9, 5, 'Y501', 820000.00, 'available'),
(9, 6, 'Y601', 1360000.00, 'available');

-- Rooms for Hotel 10 (Yogyakarta - Rajawali Kaliurang)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(10, 1, 'K101', 420000.00, 'available'),
(10, 1, 'K102', 420000.00, 'available'),
(10, 2, 'K201', 575000.00, 'available'),
(10, 2, 'K202', 575000.00, 'available'),
(10, 3, 'K301', 635000.00, 'available'),
(10, 4, 'K401', 880000.00, 'available'),
(10, 5, 'K501', 835000.00, 'available'),
(10, 6, 'K601', 1375000.00, 'available');

-- Rooms for Hotel 11 (Makassar - Celebes Waterfront)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(11, 1, 'M101', 430000.00, 'available'),
(11, 1, 'M102', 430000.00, 'available'),
(11, 2, 'M201', 590000.00, 'available'),
(11, 2, 'M202', 590000.00, 'available'),
(11, 3, 'M301', 645000.00, 'available'),
(11, 4, 'M401', 895000.00, 'available'),
(11, 5, 'M501', 845000.00, 'available'),
(11, 6, 'M601', 1390000.00, 'available');

-- Rooms for Hotel 12 (Makassar - Celebes Losari)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(12, 1, 'L101', 440000.00, 'available'),
(12, 1, 'L102', 440000.00, 'available'),
(12, 2, 'L201', 605000.00, 'available'),
(12, 2, 'L202', 605000.00, 'available'),
(12, 3, 'L301', 660000.00, 'available'),
(12, 3, 'L302', 660000.00, 'available'),
(12, 4, 'L401', 910000.00, 'available'),
(12, 5, 'L501', 860000.00, 'available'),
(12, 6, 'L601', 1405000.00, 'available');

-- Rooms for Hotel 13 (Manado - Utama Premier)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(13, 1, 'U101', 415000.00, 'available'),
(13, 1, 'U102', 415000.00, 'available'),
(13, 2, 'U201', 570000.00, 'available'),
(13, 2, 'U202', 570000.00, 'available'),
(13, 3, 'U301', 625000.00, 'available'),
(13, 4, 'U401', 875000.00, 'available'),
(13, 5, 'U501', 830000.00, 'available'),
(13, 6, 'U601', 1370000.00, 'available');

-- Rooms for Hotel 14 (Palembang - Sriwijaya Luxury)
INSERT INTO `list_kamar` (id_list_hotel, id_detail_kamar, room_number, price, status) VALUES
(14, 1, 'S101', 425000.00, 'available'),
(14, 1, 'S102', 425000.00, 'available'),
(14, 2, 'S201', 585000.00, 'available'),
(14, 2, 'S202', 585000.00, 'available'),
(14, 3, 'S301', 640000.00, 'available'),
(14, 3, 'S302', 640000.00, 'available'),
(14, 4, 'S401', 890000.00, 'available'),
(14, 5, 'S501', 845000.00, 'available'),
(14, 6, 'S601', 1385000.00, 'available');

-- ===================================
-- Add deskripsi_hotel for new hotels
-- ===================================

INSERT INTO `deskripsi_hotel` (id_list_hotel, description, facility, policy) VALUES
(9, 'Hotel Rajawali berlokasi di jantung Yogyakarta dengan akses mudah ke Malioboro. Menawarkan pengalaman menginap berkelas dengan layanan terbaik.', 
'WiFi gratis, AC, TV LED, Kamar mandi mewah, Kolam renang, Restoran, Gym, Spa, Resepsi 24 jam', 
'Check-in: 14:00, Check-out: 12:00, Gratis pembatalan hingga 24 jam sebelum check-in'),

(10, 'Resor Rajawali Kaliurang menawarkan pemandangan alam yang indah dengan fasilitas resort lengkap. Cocok untuk liburan keluarga maupun honeymoon.',
'WiFi gratis, AC, TV LED, Kolam renang, Taman, Restoran lokal, Hiking trail, Pemandangan pegunungan, Parkir gratis',
'Check-in: 14:00, Check-out: 12:00, Gratis pembatalan hingga 3 hari sebelum check-in'),

(11, 'Hotel Celebes Makassar berlokasi di waterfront dengan pemandangan teluk yang menakjubkan. Fasilitas modern dan layanan prima.',
'WiFi gratis, AC, TV LED, Kamar mandi premium, Kolam renang infinity, Spa, Restoran, Bar lounge, Concierge 24 jam',
'Check-in: 15:00, Check-out: 11:00, Gratis pembatalan hingga 24 jam sebelum check-in'),

(12, 'Hotel Celebes Losari menghadap langsung ke pantai Losari dengan suasana romantis. Sempurna untuk couples dan keluarga.',
'WiFi gratis, AC, TV LED, Balkon pribadi, Pantai pribadi, Restoran seafood, Sunset lounge, Parkir gratis',
'Check-in: 15:00, Check-out: 11:00, Harga termasuk sarapan buffet'),

(13, 'Hotel Utama Manado menawarkan kemewahan modern di pusat kota. Dekat dengan pusat bisnis dan pariwisata Manado.',
'WiFi gratis, AC, TV LED, Kamar mandi mewah, Kolam renang rooftop, Restoran, Meeting room, Business center',
'Check-in: 14:00, Check-out: 12:00, Gratis pembatalan hingga 1 hari sebelum check-in'),

(14, 'Sriwijaya Palembang Luxury menawarkan pengalaman hotel bintang lima dengan interior mewah dan pelayanan eksklusif.',
'WiFi gratis, AC, TV LED, Kamar mandi dengan bathtub, Kolam renang, Spa, Restoran fine dining, Airport transfer',
'Check-in: 16:00, Check-out: 10:00, Harga termasuk breakfast dan welcome drink');
