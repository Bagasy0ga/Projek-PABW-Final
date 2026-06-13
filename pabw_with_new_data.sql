-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: pabw
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `company_profile`
--

DROP TABLE IF EXISTS `company_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profile` (
  `id_company_profile` int NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `username` varchar(20) NOT NULL,
  `id_user` int DEFAULT NULL,
  `password` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id_company_profile`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_id_admin` (`id_user`),
  CONSTRAINT `fk_company_profile_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profile`
--

LOCK TABLES `company_profile` WRITE;
/*!40000 ALTER TABLE `company_profile` DISABLE KEYS */;
INSERT INTO `company_profile` VALUES (1,'Maju Jaya Hotel Group','Jl. Diponegoro No. 123, Jakarta Pusat','021-1234567','majujaya@hotelgroup.com','7mj2k4x',3,'Pass@Maju2024'),(2,'Bintang Nusantara Hospitality','Jl. Ahmad Yani No. 456, Surabaya','031-2345678','bintangnusantara@hotelgroup.com','3bn4x9w',3,'BintangSecure88'),(3,'Pesona Pantai Resort','Jl. Pantai Kuta, Bali','0361-3456789','pesonapantai@hotelgroup.com','9pp1w5r',3,'PesonaBeach2026'),(4,'Pegunungan Indah Resort','Jl. Raya Bandung-Jakarta Km 50, Bandung','022-4567890','pegunungganindah@hotelgroup.com','2pi6r8t',3,'MountainStay123'),(5,'Kota Tua Heritage Hotels','Jl. Kota Tua No. 789, Jakarta Barat','021-5678901','kotatuaheritage@hotelgroup.com','5kt8y3m',3,'HeritageKota456'),(6,'Tropis Sejahtera Hotel','Jl. Sudirman No. 321, Medan','061-6789012','tropissejahtera@hotelgroup.com','4ts3m7n',3,'TropisMedan789'),(7,'Rajawali Yogyakarta Hotels','Jl. Malioboro No. 100, Yogyakarta','0274-512345','yogyakarta@rajawali.com','8rj4k9x',3,'RajaYogya2026'),(8,'Celebes Makassar Resort','Jl. Bumi No. 567, Makassar','0411-654321','makassar@celebes.com','6cm5l7p',3,'CelebesMak789'),(9,'Utama Manado Hotels','Jl. Tatelu No. 234, Manado','0431-876543','manado@utama.com','2um3n8q',3,'UtamaManado456'),(10,'Sriwijaya Palembang Hotel','Jl. Sultan Mahmud Badaruddin No. 890, Palembang','0711-345678','palembang@sriwijaya.com','7sr9m2r',3,'SriPalembang123'),(11,'Riau Pekanbaru Plaza','Jl. Soekarno Hatta No. 456, Pekanbaru','0761-234567','pekanbaru@riau.com','5rp6o1s',3,'RiauPekan789'),(12,'Kalimantan Indah Balikpapan','Jl. Jendral Sudirman No. 789, Balikpapan','0542-567890','balikpapan@kalind.com','3ki7j4t',3,'KaliIndah234');
/*!40000 ALTER TABLE `company_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deskripsi_hotel`
--

DROP TABLE IF EXISTS `deskripsi_hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deskripsi_hotel` (
  `id_deskripsi_hotel` int NOT NULL AUTO_INCREMENT,
  `id_list_hotel` int NOT NULL,
  `description` text NOT NULL,
  `facility` text,
  `policy` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_deskripsi_hotel`),
  UNIQUE KEY `uq_deskripsi_hotel` (`id_list_hotel`),
  CONSTRAINT `fk_deskripsi_hotel_list_hotel` FOREIGN KEY (`id_list_hotel`) REFERENCES `list_hotel` (`id_list_hotel`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deskripsi_hotel`
--

LOCK TABLES `deskripsi_hotel` WRITE;
/*!40000 ALTER TABLE `deskripsi_hotel` DISABLE KEYS */;
INSERT INTO `deskripsi_hotel` VALUES (1,9,'Hotel Rajawali berlokasi di jantung Yogyakarta dengan akses mudah ke Malioboro. Menawarkan pengalaman menginap berkelas dengan layanan terbaik.','WiFi gratis, AC, TV LED, Kamar mandi mewah, Kolam renang, Restoran, Gym, Spa, Resepsi 24 jam','Check-in: 14:00, Check-out: 12:00, Gratis pembatalan hingga 24 jam sebelum check-in','2026-06-13 10:01:01','2026-06-13 10:01:01'),(2,10,'Resor Rajawali Kaliurang menawarkan pemandangan alam yang indah dengan fasilitas resort lengkap. Cocok untuk liburan keluarga maupun honeymoon.','WiFi gratis, AC, TV LED, Kolam renang, Taman, Restoran lokal, Hiking trail, Pemandangan pegunungan, Parkir gratis','Check-in: 14:00, Check-out: 12:00, Gratis pembatalan hingga 3 hari sebelum check-in','2026-06-13 10:01:01','2026-06-13 10:01:01'),(3,11,'Hotel Celebes Makassar berlokasi di waterfront dengan pemandangan teluk yang menakjubkan. Fasilitas modern dan layanan prima.','WiFi gratis, AC, TV LED, Kamar mandi premium, Kolam renang infinity, Spa, Restoran, Bar lounge, Concierge 24 jam','Check-in: 15:00, Check-out: 11:00, Gratis pembatalan hingga 24 jam sebelum check-in','2026-06-13 10:01:01','2026-06-13 10:01:01'),(4,12,'Hotel Celebes Losari menghadap langsung ke pantai Losari dengan suasana romantis. Sempurna untuk couples dan keluarga.','WiFi gratis, AC, TV LED, Balkon pribadi, Pantai pribadi, Restoran seafood, Sunset lounge, Parkir gratis','Check-in: 15:00, Check-out: 11:00, Harga termasuk sarapan buffet','2026-06-13 10:01:01','2026-06-13 10:01:01'),(5,13,'Hotel Utama Manado menawarkan kemewahan modern di pusat kota. Dekat dengan pusat bisnis dan pariwisata Manado.','WiFi gratis, AC, TV LED, Kamar mandi mewah, Kolam renang rooftop, Restoran, Meeting room, Business center','Check-in: 14:00, Check-out: 12:00, Gratis pembatalan hingga 1 hari sebelum check-in','2026-06-13 10:01:01','2026-06-13 10:01:01'),(6,14,'Sriwijaya Palembang Luxury menawarkan pengalaman hotel bintang lima dengan interior mewah dan pelayanan eksklusif.','WiFi gratis, AC, TV LED, Kamar mandi dengan bathtub, Kolam renang, Spa, Restoran fine dining, Airport transfer','Check-in: 16:00, Check-out: 10:00, Harga termasuk breakfast dan welcome drink','2026-06-13 10:01:01','2026-06-13 10:01:01');
/*!40000 ALTER TABLE `deskripsi_hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detail_kamar`
--

DROP TABLE IF EXISTS `detail_kamar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detail_kamar` (
  `id_detail_kamar` int NOT NULL AUTO_INCREMENT,
  `type_room` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `facility` text NOT NULL,
  `capacity` int NOT NULL,
  PRIMARY KEY (`id_detail_kamar`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detail_kamar`
--

LOCK TABLES `detail_kamar` WRITE;
/*!40000 ALTER TABLE `detail_kamar` DISABLE KEYS */;
INSERT INTO `detail_kamar` VALUES (1,'Standard Room','Kamar standar dengan tempat tidur single','AC, TV LED 32 inch, Kamar mandi pribadi, WiFi gratis, Tempat tidur single',1),(2,'Double Room','Kamar dengan tempat tidur double bed','AC, TV LED 42 inch, Kamar mandi pribadi dengan shower, WiFi gratis, Tempat tidur double, Meja kerja',2),(3,'Twin Room','Kamar dengan dua tempat tidur single','AC, TV LED 40 inch, Kamar mandi pribadi dengan bathtub, WiFi gratis, Dua tempat tidur single',2),(4,'Suite Room','Kamar suite dengan ruang tamu terpisah','AC, TV LED 50 inch, Kamar mandi mewah, WiFi gratis, Ruang tamu, Tempat tidur king size, Mini bar',2),(5,'Deluxe Room','Kamar deluxe dengan pemandangan laut','AC, TV LED 46 inch, Kamar mandi premium, WiFi gratis, Balkon, Tempat tidur king size, Safe deposit box',2),(6,'Family Room','Kamar untuk keluarga dengan ruang yang luas','AC, TV LED 50 inch, 2 kamar mandi, WiFi gratis, Ruang tamu, 2 tempat tidur, Minibar',4),(7,'Standard Room','Kamar standar dengan tempat tidur single','AC, TV LED 32 inch, Kamar mandi pribadi, , Tempat tidur single',1),(8,'Double Room','Kamar dengan tempat tidur double bed','AC, TV LED 42 inch, Kamar mandi pribadi dengan shower, , Tempat tidur double, Meja kerja',2),(9,'Twin Room','Kamar dengan dua tempat tidur single','AC, TV LED 40 inch, Kamar mandi pribadi dengan bathtub, , Dua tempat tidur single',2),(10,'Suite Room','Kamar suite dengan ruang tamu terpisah','AC, TV LED 50 inch, Kamar mandi mewah, , Ruang tamu, Tempat tidur king size, Mini bar',2),(11,'Deluxe Room','Kamar deluxe dengan pemandangan laut','AC, TV LED 46 inch, Kamar mandi premium, , Balkon, Tempat tidur king size, Safe deposit box',2),(12,'Family Room','Kamar untuk keluarga dengan ruang yang luas','AC, TV LED 50 inch, 2 kamar mandi, , Ruang tamu, 2 tempat tidur, Minibar',4),(13,'Double Room Basic','Kamar dengan tempat tidur double bed.','WiFi, AC, Mini Bar',4);
/*!40000 ALTER TABLE `detail_kamar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verification_codes`
--

DROP TABLE IF EXISTS `email_verification_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verification_codes` (
  `id_code` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `purpose` enum('verify_email','reset_password','login_otp','change_password') NOT NULL DEFAULT 'verify_email',
  `otp_hash` varchar(255) NOT NULL,
  `attempts` int NOT NULL DEFAULT '0',
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_code`),
  KEY `idx_email_purpose` (`email`,`purpose`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verification_codes`
--

LOCK TABLES `email_verification_codes` WRITE;
/*!40000 ALTER TABLE `email_verification_codes` DISABLE KEYS */;
INSERT INTO `email_verification_codes` VALUES (1,'bagas.y064@gmail.com','verify_email','eb22016fa9c0c6d2f01bb94a640be7bc0031374143db46793655f607e9916bf0',0,'2026-06-08 03:49:28','2026-06-08 03:39:52','2026-06-08 03:39:28'),(2,'bagas.y064@gmail.com','verify_email','66ec87a35e033b6450897519a830340a486316409f4b44454df22a8c2c7b9dfa',0,'2026-06-08 03:49:52','2026-06-08 04:01:52','2026-06-08 03:39:52'),(3,'bagas.y064@gmail.com','verify_email','dbc23464f3dbd24bffffad01aef8fb6f6105063e7150d3835f14d21597570fe7',0,'2026-06-08 04:11:52','2026-06-08 04:12:45','2026-06-08 04:01:52'),(4,'bagas.y064@gmail.com','verify_email','8d02418b5e1a3287f268c6149065bfa547098b76b4e9dc0253dd2bf2faf0d0bd',0,'2026-06-08 04:22:45','2026-06-08 04:13:16','2026-06-08 04:12:45'),(5,'bagas.y064@gmail.com','reset_password','c4c67b9c9b3dfaac8e2c721f74b29b722d320fa66dc24c6596a2656bce83e3a5',0,'2026-06-08 05:01:21','2026-06-08 04:51:24','2026-06-08 04:51:21'),(6,'bagas.y064@gmail.com','reset_password','f7c56eb8cd6b2a6de49cf703268a6e306136f0d33bf0a1e63b8b3a9d404a9820',0,'2026-06-08 05:01:24','2026-06-08 05:05:51','2026-06-08 04:51:24'),(7,'bagas.y064@gmail.com','reset_password','bde9f6d97faaa27bc4d07e97517c8968b9937cb7631c88dcad9ca0c3987c6c14',0,'2026-06-08 05:15:51','2026-06-08 05:12:15','2026-06-08 05:05:51'),(8,'bagas.y064@gmail.com','reset_password','66b34de7a87f9c2e54e1413892f982591149e712cfb2aa8b4b03c274c21219ba',0,'2026-06-08 05:22:15','2026-06-08 05:12:28','2026-06-08 05:12:15'),(9,'bagas.y064@gmail.com','login_otp','0ada0f4c14202f287c03e1ef12ef775efeba13cbf874933a7d092fb326f0793a',0,'2026-06-08 05:30:26','2026-06-08 05:20:37','2026-06-08 05:20:26'),(10,'bagas.y064@gmail.com','login_otp','021016678cab0aefba0fa6fa8080b98ef1a57c1e43dbb53d93344ae66b565636',0,'2026-06-08 05:30:37','2026-06-08 05:20:52','2026-06-08 05:20:37'),(11,'bagas.y064@gmail.com','login_otp','d2955a2e496a458708097f7f7fdca6b739eab44fa3810c6056c6d95668c4af45',0,'2026-06-08 05:30:52','2026-06-08 05:23:15','2026-06-08 05:20:52'),(12,'bagas.y064@gmail.com','login_otp','f0c1f414481302f0a554c53c4f82fe9d9af736658e4d5f05be91eae2474817d4',0,'2026-06-08 05:33:15','2026-06-08 05:23:33','2026-06-08 05:23:15'),(13,'bagas.y064@gmail.com','login_otp','21ce381560824731c233d60b9639bf412928d356dec9d3b168348f38ae06592f',0,'2026-06-08 05:33:33','2026-06-08 05:28:25','2026-06-08 05:23:33'),(14,'bagas.y064@gmail.com','login_otp','7ac2e8da3017c5aadcb3659934bd649baefd35df8308bddd5499de3d20da50b6',0,'2026-06-08 05:38:25','2026-06-08 05:28:41','2026-06-08 05:28:25'),(15,'bagas.y064@gmail.com','login_otp','0243ae2f4c498ad8692e1276fb80692ef2dd8e853b5dd80c8ea930b453421e7f',0,'2026-06-08 05:39:21','2026-06-08 05:29:36','2026-06-08 05:29:21'),(16,'bagas.y064@gmail.com','change_password','95809b116a3417608faf59914253f91f6a55a3aea7b6f079f94d2e16ff1afbed',0,'2026-06-08 05:48:04','2026-06-08 05:38:24','2026-06-08 05:38:04'),(17,'yazetooo@gmail.com','verify_email','e42406611aa35567847a2806249497bc27cfbfe076b8047fb94b715dc6314547',0,'2026-06-11 11:39:32','2026-06-11 11:30:20','2026-06-11 11:29:32');
/*!40000 ALTER TABLE `email_verification_codes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_purchase`
--

DROP TABLE IF EXISTS `history_purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history_purchase` (
  `id_history` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `id_company_profile` int NOT NULL,
  `id_list_kamar` int NOT NULL,
  `purchase_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `checkin_time` datetime NOT NULL,
  `checkout_time` datetime NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('confirmed','cancelled','checkin','checkout') DEFAULT 'confirmed',
  PRIMARY KEY (`id_history`),
  KEY `fk_history_user` (`id_user`),
  KEY `fk_history_company` (`id_company_profile`),
  KEY `fk_history_kamar` (`id_list_kamar`),
  CONSTRAINT `fk_history_company` FOREIGN KEY (`id_company_profile`) REFERENCES `company_profile` (`id_company_profile`),
  CONSTRAINT `fk_history_kamar` FOREIGN KEY (`id_list_kamar`) REFERENCES `list_kamar` (`id_list_kamar`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_purchase`
--

LOCK TABLES `history_purchase` WRITE;
/*!40000 ALTER TABLE `history_purchase` DISABLE KEYS */;
INSERT INTO `history_purchase` VALUES (1,1,1,1,'2026-06-17 00:00:00','2026-06-17 00:00:00','2026-06-18 00:00:00',500000.00,'confirmed'),(2,4,2,66,'2026-06-08 07:05:13','2026-06-08 16:00:00','2026-06-09 16:00:00',400000.00,'confirmed'),(3,5,2,131,'2026-06-11 11:37:36','2026-06-11 16:00:00','2026-06-16 16:00:00',4125000.00,'confirmed'),(4,5,2,132,'2026-06-11 11:37:36','2026-06-11 16:00:00','2026-06-16 16:00:00',4125000.00,'confirmed'),(5,5,2,133,'2026-06-11 11:37:36','2026-06-11 16:00:00','2026-06-16 16:00:00',4125000.00,'confirmed'),(6,5,2,134,'2026-06-11 11:37:36','2026-06-11 16:00:00','2026-06-16 16:00:00',4125000.00,'confirmed'),(7,5,2,135,'2026-06-11 11:37:36','2026-06-11 16:00:00','2026-06-16 16:00:00',4125000.00,'confirmed');
/*!40000 ALTER TABLE `history_purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hotel_rating`
--

DROP TABLE IF EXISTS `hotel_rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `hotel_rating` (
  `id_rating` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `id_list_hotel` int NOT NULL,
  `id_history` int NOT NULL,
  `rating` tinyint NOT NULL,
  `review` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rating`),
  UNIQUE KEY `unique_rating_per_history` (`id_history`),
  KEY `fk_rating_user` (`id_user`),
  KEY `fk_rating_hotel` (`id_list_hotel`),
  CONSTRAINT `fk_rating_history` FOREIGN KEY (`id_history`) REFERENCES `history_purchase` (`id_history`),
  CONSTRAINT `fk_rating_hotel` FOREIGN KEY (`id_list_hotel`) REFERENCES `list_hotel` (`id_list_hotel`),
  CONSTRAINT `fk_rating_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  CONSTRAINT `chk_rating_value` CHECK ((`rating` between 1 and 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hotel_rating`
--

LOCK TABLES `hotel_rating` WRITE;
/*!40000 ALTER TABLE `hotel_rating` DISABLE KEYS */;
/*!40000 ALTER TABLE `hotel_rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_hotel`
--

DROP TABLE IF EXISTS `list_hotel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_hotel` (
  `id_list_hotel` int NOT NULL AUTO_INCREMENT,
  `id_company_profile` int NOT NULL,
  `hotel_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `contact_person` varchar(255) NOT NULL,
  `contact_email` varchar(255) NOT NULL,
  `contact_phone` varchar(20) NOT NULL,
  PRIMARY KEY (`id_list_hotel`),
  KEY `fk_hotel_company` (`id_company_profile`),
  CONSTRAINT `fk_hotel_company` FOREIGN KEY (`id_company_profile`) REFERENCES `company_profile` (`id_company_profile`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_hotel`
--

LOCK TABLES `list_hotel` WRITE;
/*!40000 ALTER TABLE `list_hotel` DISABLE KEYS */;
INSERT INTO `list_hotel` VALUES (1,1,'Hotel Maju Jaya Jakarta Pusat','Jl. Diponegoro No. 123, Jakarta Pusat','Bapak Susanto','jakarta@majujaya.com','021-1111111'),(2,1,'Hotel Maju Jaya Suryakencana','Jl. Suryakencana No. 250, Jakarta Selatan','Ibu Siti','suryakencana@majujaya.com','021-2222222'),(3,2,'Bintang Nusantara Surabaya','Jl. Ahmad Yani No. 456, Surabaya','Bapak Hendra','surabaya@bintangnusantara.com','031-3333333'),(4,2,'Bintang Nusantara Lombok','Jl. Raya Lombok No. 789, Lombok Utara','Ibu Rina','lombok@bintangnusantara.com','0370-4444444'),(5,3,'Pesona Pantai Kuta Beach','Jl. Pantai Kuta No. 100, Bali','Bapak Agus','kuta@pesonapantai.com','0361-5555555'),(6,4,'Pegunungan Indah Bandung','Jl. Raya Bandung-Jakarta Km 50, Bandung','Ibu Maya','bandung@pegunungganindah.com','022-6666666'),(7,5,'Kota Tua Heritage Jakarta','Jl. Kota Tua No. 789, Jakarta Barat','Bapak Bambang','heritage@kotatua.com','021-7777777'),(8,6,'Tropis Sejahtera Medan','Jl. Sudirman No. 321, Medan','Ibu Lina','medan@tropissejahtera.com','061-8888888'),(9,7,'Rajawali Jogja Palace','Jl. Malioboro No. 100, Yogyakarta','Bapak Arif','yogyakarta@rajawali.com','0274-111111'),(10,7,'Rajawali Kaliurang Resort','Jl. Kaliurang Km 10, Yogyakarta','Ibu Susi','kaliurang@rajawali.com','0274-222222'),(11,8,'Celebes Makassar Waterfront','Jl. Bumi No. 567, Makassar','Bapak Doni','makassar@celebes.com','0411-333333'),(12,8,'Celebes Losari Sunset Hotel','Jl. Perintis Kemerdekaan, Makassar','Ibu Ratna','losari@celebes.com','0411-444444'),(13,9,'Utama Manado Premier','Jl. Tatelu No. 234, Manado','Bapak Rendi','manado@utama.com','0431-555555'),(14,10,'Sriwijaya Palembang Luxury','Jl. Sultan Mahmud Badaruddin No. 890, Palembang','Ibu Tina','palembang@sriwijaya.com','0711-666666');
/*!40000 ALTER TABLE `list_hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_kamar`
--

DROP TABLE IF EXISTS `list_kamar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `list_kamar` (
  `id_list_kamar` int NOT NULL AUTO_INCREMENT,
  `id_list_hotel` int NOT NULL,
  `id_detail_kamar` int NOT NULL,
  `room_number` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` enum('available','not available') DEFAULT 'available',
  PRIMARY KEY (`id_list_kamar`),
  KEY `fk_kamar_hotel` (`id_list_hotel`),
  KEY `fk_kamar_detail` (`id_detail_kamar`),
  CONSTRAINT `fk_kamar_detail` FOREIGN KEY (`id_detail_kamar`) REFERENCES `detail_kamar` (`id_detail_kamar`),
  CONSTRAINT `fk_kamar_hotel` FOREIGN KEY (`id_list_hotel`) REFERENCES `list_hotel` (`id_list_hotel`)
) ENGINE=InnoDB AUTO_INCREMENT=387 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_kamar`
--

LOCK TABLES `list_kamar` WRITE;
/*!40000 ALTER TABLE `list_kamar` DISABLE KEYS */;
INSERT INTO `list_kamar` VALUES (1,1,1,'A101',350000.00,'available'),(2,1,1,'A102',350000.00,'available'),(3,1,1,'A103',350000.00,'available'),(4,1,1,'A104',350000.00,'available'),(5,1,1,'A105',350000.00,'not available'),(6,1,2,'B101',500000.00,'available'),(7,1,2,'B102',500000.00,'available'),(8,1,2,'B103',500000.00,'available'),(9,1,2,'B104',500000.00,'available'),(10,1,2,'B105',500000.00,'not available'),(11,1,3,'C101',550000.00,'available'),(12,1,3,'C102',550000.00,'available'),(13,1,3,'C103',550000.00,'available'),(14,1,3,'C104',550000.00,'available'),(15,1,3,'C105',550000.00,'available'),(16,1,4,'D101',800000.00,'available'),(17,1,4,'D102',800000.00,'available'),(18,1,4,'D103',800000.00,'not available'),(19,1,5,'E101',750000.00,'available'),(20,1,5,'E102',750000.00,'available'),(21,1,5,'E103',750000.00,'available'),(22,1,5,'E104',750000.00,'available'),(23,1,6,'F101',1200000.00,'available'),(24,1,6,'F102',1200000.00,'available'),(25,1,6,'F103',1200000.00,'available'),(26,1,1,'A106',350000.00,'available'),(27,1,2,'B106',500000.00,'available'),(28,1,3,'C106',550000.00,'available'),(29,1,4,'D104',800000.00,'available'),(30,1,5,'E105',750000.00,'available'),(31,2,1,'A201',375000.00,'available'),(32,2,1,'A202',375000.00,'available'),(33,2,1,'A203',375000.00,'available'),(34,2,1,'A204',375000.00,'available'),(35,2,1,'A205',375000.00,'available'),(36,2,2,'B201',525000.00,'available'),(37,2,2,'B202',525000.00,'available'),(38,2,2,'B203',525000.00,'available'),(39,2,2,'B204',525000.00,'not available'),(40,2,2,'B205',525000.00,'available'),(41,2,3,'C201',575000.00,'available'),(42,2,3,'C202',575000.00,'available'),(43,2,3,'C203',575000.00,'available'),(44,2,3,'C204',575000.00,'available'),(45,2,3,'C205',575000.00,'available'),(46,2,4,'D201',825000.00,'available'),(47,2,4,'D202',825000.00,'available'),(48,2,4,'D203',825000.00,'available'),(49,2,5,'E201',775000.00,'available'),(50,2,5,'E202',775000.00,'available'),(51,2,5,'E203',775000.00,'not available'),(52,2,5,'E204',775000.00,'available'),(53,2,6,'F201',1250000.00,'available'),(54,2,6,'F202',1250000.00,'available'),(55,2,6,'F203',1250000.00,'available'),(56,2,1,'A206',375000.00,'available'),(57,2,2,'B206',525000.00,'available'),(58,2,3,'C206',575000.00,'available'),(59,2,4,'D204',825000.00,'available'),(60,2,5,'E205',775000.00,'available'),(61,2,1,'A207',375000.00,'available'),(62,2,2,'B207',525000.00,'available'),(63,2,3,'C207',575000.00,'available'),(64,2,4,'D205',825000.00,'available'),(65,2,5,'E206',775000.00,'available'),(66,3,1,'A301',400000.00,'not available'),(67,3,1,'A302',400000.00,'available'),(68,3,1,'A303',400000.00,'available'),(69,3,1,'A304',400000.00,'available'),(70,3,1,'A305',400000.00,'available'),(71,3,1,'A306',400000.00,'available'),(72,3,2,'B301',550000.00,'available'),(73,3,2,'B302',550000.00,'available'),(74,3,2,'B303',550000.00,'available'),(75,3,2,'B304',550000.00,'available'),(76,3,2,'B305',550000.00,'not available'),(77,3,2,'B306',550000.00,'available'),(78,3,3,'C301',600000.00,'available'),(79,3,3,'C302',600000.00,'available'),(80,3,3,'C303',600000.00,'available'),(81,3,3,'C304',600000.00,'available'),(82,3,3,'C305',600000.00,'available'),(83,3,3,'C306',600000.00,'available'),(84,3,4,'D301',850000.00,'available'),(85,3,4,'D302',850000.00,'available'),(86,3,4,'D303',850000.00,'available'),(87,3,4,'D304',850000.00,'available'),(88,3,5,'E301',800000.00,'available'),(89,3,5,'E302',800000.00,'available'),(90,3,5,'E303',800000.00,'available'),(91,3,5,'E304',800000.00,'available'),(92,3,5,'E305',800000.00,'available'),(93,3,6,'F301',1300000.00,'available'),(94,3,6,'F302',1300000.00,'available'),(95,3,6,'F303',1300000.00,'available'),(96,3,1,'A307',400000.00,'available'),(97,3,2,'B307',550000.00,'available'),(98,3,3,'C307',600000.00,'available'),(99,3,4,'D305',850000.00,'available'),(100,3,5,'E306',800000.00,'available'),(101,3,1,'A308',400000.00,'not available'),(102,3,2,'B308',550000.00,'available'),(103,3,3,'C308',600000.00,'available'),(104,3,4,'D306',850000.00,'available'),(105,3,5,'E307',800000.00,'available'),(106,4,1,'A401',425000.00,'available'),(107,4,1,'A402',425000.00,'available'),(108,4,1,'A403',425000.00,'available'),(109,4,1,'A404',425000.00,'available'),(110,4,1,'A405',425000.00,'available'),(111,4,1,'A406',425000.00,'available'),(112,4,1,'A407',425000.00,'available'),(113,4,2,'B401',575000.00,'available'),(114,4,2,'B402',575000.00,'available'),(115,4,2,'B403',575000.00,'available'),(116,4,2,'B404',575000.00,'available'),(117,4,2,'B405',575000.00,'available'),(118,4,2,'B406',575000.00,'available'),(119,4,3,'C401',625000.00,'available'),(120,4,3,'C402',625000.00,'available'),(121,4,3,'C403',625000.00,'available'),(122,4,3,'C404',625000.00,'available'),(123,4,3,'C405',625000.00,'available'),(124,4,3,'C406',625000.00,'available'),(125,4,3,'C407',625000.00,'not available'),(126,4,4,'D401',875000.00,'available'),(127,4,4,'D402',875000.00,'available'),(128,4,4,'D403',875000.00,'available'),(129,4,4,'D404',875000.00,'available'),(130,4,4,'D405',875000.00,'available'),(131,4,5,'E401',825000.00,'not available'),(132,4,5,'E402',825000.00,'not available'),(133,4,5,'E403',825000.00,'not available'),(134,4,5,'E404',825000.00,'not available'),(135,4,5,'E405',825000.00,'not available'),(136,4,5,'E406',825000.00,'available'),(137,4,6,'F401',1350000.00,'available'),(138,4,6,'F402',1350000.00,'available'),(139,4,6,'F403',1350000.00,'available'),(140,4,6,'F404',1350000.00,'available'),(141,4,1,'A408',425000.00,'available'),(142,4,2,'B407',575000.00,'available'),(143,4,3,'C408',625000.00,'available'),(144,4,4,'D406',875000.00,'available'),(145,4,5,'E407',825000.00,'available'),(146,4,1,'A409',425000.00,'available'),(147,4,2,'B408',575000.00,'available'),(148,4,3,'C409',625000.00,'available'),(149,4,4,'D407',875000.00,'available'),(150,4,5,'E408',825000.00,'available'),(151,5,1,'A501',450000.00,'available'),(152,5,1,'A502',450000.00,'available'),(153,5,1,'A503',450000.00,'available'),(154,5,1,'A504',450000.00,'available'),(155,5,1,'A505',450000.00,'available'),(156,5,1,'A506',450000.00,'available'),(157,5,1,'A507',450000.00,'available'),(158,5,1,'A508',450000.00,'not available'),(159,5,2,'B501',600000.00,'available'),(160,5,2,'B502',600000.00,'available'),(161,5,2,'B503',600000.00,'available'),(162,5,2,'B504',600000.00,'available'),(163,5,2,'B505',600000.00,'available'),(164,5,2,'B506',600000.00,'available'),(165,5,2,'B507',600000.00,'available'),(166,5,3,'C501',650000.00,'available'),(167,5,3,'C502',650000.00,'available'),(168,5,3,'C503',650000.00,'available'),(169,5,3,'C504',650000.00,'available'),(170,5,3,'C505',650000.00,'available'),(171,5,3,'C506',650000.00,'available'),(172,5,3,'C507',650000.00,'available'),(173,5,3,'C508',650000.00,'available'),(174,5,4,'D501',900000.00,'available'),(175,5,4,'D502',900000.00,'available'),(176,5,4,'D503',900000.00,'available'),(177,5,4,'D504',900000.00,'available'),(178,5,4,'D505',900000.00,'available'),(179,5,4,'D506',900000.00,'available'),(180,5,5,'E501',850000.00,'available'),(181,5,5,'E502',850000.00,'available'),(182,5,5,'E503',850000.00,'available'),(183,5,5,'E504',850000.00,'available'),(184,5,5,'E505',850000.00,'available'),(185,5,5,'E506',850000.00,'not available'),(186,5,5,'E507',850000.00,'available'),(187,5,5,'E508',850000.00,'available'),(188,5,6,'F501',1400000.00,'available'),(189,5,6,'F502',1400000.00,'available'),(190,5,6,'F503',1400000.00,'available'),(191,5,6,'F504',1400000.00,'available'),(192,5,6,'F505',1400000.00,'available'),(193,5,1,'A509',450000.00,'available'),(194,5,2,'B508',600000.00,'available'),(195,5,3,'C509',650000.00,'available'),(196,5,4,'D507',900000.00,'available'),(197,5,5,'E509',850000.00,'available'),(198,6,1,'A601',380000.00,'available'),(199,6,1,'A602',380000.00,'available'),(200,6,1,'A603',380000.00,'available'),(201,6,1,'A604',380000.00,'available'),(202,6,1,'A605',380000.00,'available'),(203,6,2,'B601',530000.00,'available'),(204,6,2,'B602',530000.00,'available'),(205,6,2,'B603',530000.00,'available'),(206,6,2,'B604',530000.00,'not available'),(207,6,2,'B605',530000.00,'available'),(208,6,3,'C601',580000.00,'available'),(209,6,3,'C602',580000.00,'available'),(210,6,3,'C603',580000.00,'available'),(211,6,3,'C604',580000.00,'available'),(212,6,3,'C605',580000.00,'available'),(213,6,4,'D601',830000.00,'available'),(214,6,4,'D602',830000.00,'available'),(215,6,4,'D603',830000.00,'available'),(216,6,5,'E601',780000.00,'available'),(217,6,5,'E602',780000.00,'available'),(218,6,5,'E603',780000.00,'available'),(219,6,5,'E604',780000.00,'available'),(220,6,6,'F601',1280000.00,'available'),(221,6,6,'F602',1280000.00,'available'),(222,6,6,'F603',1280000.00,'available'),(223,6,1,'A606',380000.00,'available'),(224,6,2,'B606',530000.00,'available'),(225,6,3,'C606',580000.00,'available'),(226,6,4,'D604',830000.00,'available'),(227,6,5,'E605',780000.00,'available'),(228,6,1,'A607',380000.00,'available'),(229,6,2,'B607',530000.00,'available'),(230,6,3,'C607',580000.00,'available'),(231,2,2,'B208',525000.00,'available'),(232,1,3,'H702',1250000.00,'available'),(233,1,1,'H703',1500000.00,'available'),(234,1,1,'H705',1500000.00,'available'),(235,2,2,'101',350000.00,'available'),(236,7,1,'H701',400000.00,'available'),(237,7,1,'H702',400000.00,'available'),(238,7,1,'H703',400000.00,'available'),(239,7,2,'H704',550000.00,'available'),(240,7,2,'H705',550000.00,'available'),(241,7,2,'H706',550000.00,'available'),(242,7,3,'H707',600000.00,'available'),(243,7,3,'H708',600000.00,'available'),(244,7,3,'H709',600000.00,'available'),(245,7,4,'H710',850000.00,'available'),(246,7,4,'H711',850000.00,'available'),(247,7,5,'H712',800000.00,'available'),(248,7,5,'H713',800000.00,'available'),(249,7,6,'H714',1250000.00,'available'),(250,7,1,'H715',400000.00,'not available'),(251,8,1,'H801',380000.00,'available'),(252,8,1,'H802',380000.00,'available'),(253,8,1,'H803',380000.00,'available'),(254,8,2,'H804',530000.00,'available'),(255,8,2,'H805',530000.00,'available'),(256,8,2,'H806',530000.00,'available'),(257,8,3,'H807',580000.00,'available'),(258,8,3,'H808',580000.00,'available'),(259,8,3,'H809',580000.00,'available'),(260,8,4,'H810',830000.00,'available'),(261,8,4,'H811',830000.00,'available'),(262,8,5,'H812',780000.00,'available'),(263,8,5,'H813',780000.00,'available'),(264,8,6,'H814',1230000.00,'available'),(265,8,1,'H815',380000.00,'not available'),(266,7,1,'H701',400000.00,'available'),(267,7,1,'H702',400000.00,'available'),(268,7,1,'H703',400000.00,'available'),(269,7,2,'H704',550000.00,'available'),(270,7,2,'H705',550000.00,'available'),(271,7,2,'H706',550000.00,'available'),(272,7,3,'H707',600000.00,'available'),(273,7,3,'H708',600000.00,'available'),(274,7,3,'H709',600000.00,'available'),(275,7,4,'H710',850000.00,'available'),(276,7,4,'H711',850000.00,'available'),(277,7,5,'H712',800000.00,'available'),(278,7,5,'H713',800000.00,'available'),(279,7,6,'H714',1250000.00,'available'),(280,7,1,'H715',400000.00,'not available'),(281,8,1,'H801',380000.00,'available'),(282,8,1,'H802',380000.00,'available'),(283,8,1,'H803',380000.00,'available'),(284,8,2,'H804',530000.00,'available'),(285,8,2,'H805',530000.00,'available'),(286,8,2,'H806',530000.00,'available'),(287,8,3,'H807',580000.00,'available'),(288,8,3,'H808',580000.00,'available'),(289,8,3,'H809',580000.00,'available'),(290,8,4,'H810',830000.00,'available'),(291,8,4,'H811',830000.00,'available'),(292,8,5,'H812',780000.00,'available'),(293,8,5,'H813',780000.00,'available'),(294,8,6,'H814',1230000.00,'available'),(295,8,1,'H815',380000.00,'not available'),(296,4,1,'L104',430000.00,'available'),(297,4,1,'L105',430000.00,'available'),(298,4,2,'L204',600000.00,'available'),(299,4,2,'L205',600000.00,'available'),(300,4,3,'L304',650000.00,'available'),(301,4,4,'L404',900000.00,'available'),(302,4,5,'L504',860000.00,'available'),(303,4,6,'L604',1380000.00,'available'),(304,5,1,'K510',475000.00,'available'),(305,5,1,'K511',475000.00,'available'),(306,5,2,'K509',625000.00,'available'),(307,5,3,'K510',675000.00,'available'),(308,5,4,'K511',930000.00,'available'),(309,5,5,'K510',880000.00,'available'),(310,5,6,'K511',1425000.00,'available'),(311,6,1,'B608',395000.00,'available'),(312,6,1,'B609',395000.00,'available'),(313,6,2,'B608',550000.00,'available'),(314,6,3,'B608',605000.00,'available'),(315,6,4,'B605',855000.00,'available'),(316,6,5,'B606',805000.00,'available'),(317,6,6,'B607',1305000.00,'available'),(318,7,1,'H704',440000.00,'available'),(319,7,2,'H705',600000.00,'available'),(320,7,3,'H706',655000.00,'available'),(321,7,4,'H707',905000.00,'available'),(322,7,5,'H708',855000.00,'available'),(323,7,6,'H709',1380000.00,'available'),(324,8,1,'M104',405000.00,'available'),(325,8,1,'M105',405000.00,'available'),(326,8,2,'M204',565000.00,'available'),(327,8,2,'M205',565000.00,'available'),(328,8,3,'M304',630000.00,'available'),(329,8,3,'M305',630000.00,'available'),(330,8,4,'M404',880000.00,'available'),(331,8,5,'M504',820000.00,'available'),(332,8,5,'M505',820000.00,'available'),(333,8,6,'M604',1340000.00,'available'),(334,9,1,'Y101',410000.00,'available'),(335,9,1,'Y102',410000.00,'available'),(336,9,1,'Y103',410000.00,'available'),(337,9,2,'Y201',560000.00,'available'),(338,9,2,'Y202',560000.00,'available'),(339,9,3,'Y301',620000.00,'available'),(340,9,3,'Y302',620000.00,'available'),(341,9,4,'Y401',870000.00,'available'),(342,9,4,'Y402',870000.00,'available'),(343,9,5,'Y501',820000.00,'available'),(344,9,6,'Y601',1360000.00,'available'),(345,10,1,'K101',420000.00,'available'),(346,10,1,'K102',420000.00,'available'),(347,10,2,'K201',575000.00,'available'),(348,10,2,'K202',575000.00,'available'),(349,10,3,'K301',635000.00,'available'),(350,10,4,'K401',880000.00,'available'),(351,10,5,'K501',835000.00,'available'),(352,10,6,'K601',1375000.00,'available'),(353,11,1,'M101',430000.00,'available'),(354,11,1,'M102',430000.00,'available'),(355,11,2,'M201',590000.00,'available'),(356,11,2,'M202',590000.00,'available'),(357,11,3,'M301',645000.00,'available'),(358,11,4,'M401',895000.00,'available'),(359,11,5,'M501',845000.00,'available'),(360,11,6,'M601',1390000.00,'available'),(361,12,1,'L101',440000.00,'available'),(362,12,1,'L102',440000.00,'available'),(363,12,2,'L201',605000.00,'available'),(364,12,2,'L202',605000.00,'available'),(365,12,3,'L301',660000.00,'available'),(366,12,3,'L302',660000.00,'available'),(367,12,4,'L401',910000.00,'available'),(368,12,5,'L501',860000.00,'available'),(369,12,6,'L601',1405000.00,'available'),(370,13,1,'U101',415000.00,'available'),(371,13,1,'U102',415000.00,'available'),(372,13,2,'U201',570000.00,'available'),(373,13,2,'U202',570000.00,'available'),(374,13,3,'U301',625000.00,'available'),(375,13,4,'U401',875000.00,'available'),(376,13,5,'U501',830000.00,'available'),(377,13,6,'U601',1370000.00,'available'),(378,14,1,'S101',425000.00,'available'),(379,14,1,'S102',425000.00,'available'),(380,14,2,'S201',585000.00,'available'),(381,14,2,'S202',585000.00,'available'),(382,14,3,'S301',640000.00,'available'),(383,14,3,'S302',640000.00,'available'),(384,14,4,'S401',890000.00,'available'),(385,14,5,'S501',845000.00,'available'),(386,14,6,'S601',1385000.00,'available');
/*!40000 ALTER TABLE `list_kamar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_login`
--

DROP TABLE IF EXISTS `session_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_login` (
  `id_login` char(36) NOT NULL,
  `id_user` int NOT NULL,
  `user_type` enum('admin','mitra','customer') DEFAULT 'customer',
  `status` enum('active','inactive') DEFAULT 'active',
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity` datetime DEFAULT CURRENT_TIMESTAMP,
  `logout_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id_login`),
  KEY `idx_id_user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_login`
--

LOCK TABLES `session_login` WRITE;
/*!40000 ALTER TABLE `session_login` DISABLE KEYS */;
INSERT INTO `session_login` VALUES ('0eb00084-998f-459e-915e-803f2aeecfc1',4,'customer','inactive','2026-06-08 04:58:09','2026-06-08 04:58:11','2026-06-08 04:58:11'),('30b96adf-aae8-483a-96f9-a1ab1fb1b0d2',4,'customer','inactive','2026-06-08 04:49:44','2026-06-08 04:50:03','2026-06-08 04:50:03'),('34f3916a-3990-45c7-9c35-9827bebf95e3',4,'customer','inactive','2026-06-08 04:50:07','2026-06-08 04:51:07','2026-06-08 04:51:07'),('714762a4-821f-4ac9-ae9e-235827f82421',5,'customer','active','2026-06-11 11:30:20','2026-06-11 11:30:20',NULL),('9f3189bf-e962-406b-83d9-33f587928ca6',4,'customer','inactive','2026-06-08 05:12:52','2026-06-08 05:12:54','2026-06-08 05:12:54'),('c7bea528-db70-4054-9694-718fb3c94468',4,'customer','active','2026-06-08 05:29:36','2026-06-08 05:29:36',NULL),('d6f6737e-62b0-11f1-88e1-bcfce7007cc7',1,'customer','inactive','2026-04-21 19:39:19','2026-04-21 19:39:19','2026-04-21 21:29:16'),('d6f67c58-62b0-11f1-88e1-bcfce7007cc7',1,'customer','active','2026-04-21 21:29:16','2026-04-21 21:29:16',NULL),('d6f67f78-62b0-11f1-88e1-bcfce7007cc7',2,'customer','inactive','2026-05-20 23:20:45','2026-05-20 23:20:45','2026-06-08 02:29:51'),('d6f68155-62b0-11f1-88e1-bcfce7007cc7',2,'customer','active','2026-06-08 02:29:51','2026-06-08 02:29:51',NULL),('d6f68304-62b0-11f1-88e1-bcfce7007cc7',4,'customer','inactive','2026-06-08 04:13:16','2026-06-08 04:13:16','2026-06-08 04:25:55'),('d6f684a3-62b0-11f1-88e1-bcfce7007cc7',4,'customer','inactive','2026-06-08 04:27:46','2026-06-08 04:49:44','2026-06-08 04:49:44'),('decfd948-b736-466a-9081-5e36dd83f989',4,'customer','inactive','2026-06-08 05:28:41','2026-06-08 05:29:18','2026-06-08 05:29:18');
/*!40000 ALTER TABLE `session_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_login_backup`
--

DROP TABLE IF EXISTS `session_login_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_login_backup` (
  `id_login` int NOT NULL DEFAULT '0',
  `id_user` int NOT NULL,
  `user_type` enum('admin','mitra','customer') DEFAULT 'customer',
  `status` enum('active','inactive') DEFAULT 'active',
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity` datetime DEFAULT CURRENT_TIMESTAMP,
  `logout_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id_login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_login_backup`
--

LOCK TABLES `session_login_backup` WRITE;
/*!40000 ALTER TABLE `session_login_backup` DISABLE KEYS */;
/*!40000 ALTER TABLE `session_login_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` enum('admin','customer') DEFAULT 'customer',
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Michael','customer','0812121232','mich@gmail.com','mich123',1),(2,'Bagas Yoga','customer','081234567890','bagas@example.com','password123',1),(3,'Admin PABW','admin','08123456789','admin@pabw.com','Admin123',1),(4,'Bagas Yoga Patama Pramudika','customer','0811223344556778','bagas.y064@gmail.com','$2b$10$HzBAQrXrpN.G5TWzSgW0pu3QbjF122s0R3HKAvLKEVs8cILY5Pb3m',1),(5,'Bagas Yoga Patama Pramudika','customer','0812333333','yazetooo@gmail.com','$2b$10$ULhAprwJRaYBkZdTiJOVtuvYJYdQS/y5a8ivgjG4nPySji98gM4z2',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-13 18:01:24
