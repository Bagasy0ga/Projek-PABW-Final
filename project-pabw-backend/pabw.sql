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
-- Table structure for table `user`
--
drop DATABASE if exists pabw;
create database pabw;

USE pabw;
DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` enum('admin', 'customer') DEFAULT 'customer',
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

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
  KEY `fk_id_user` (`id_user`),
  CONSTRAINT `fk_id_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profile`
--

LOCK TABLES `company_profile` WRITE;
/*!40000 ALTER TABLE `company_profile` DISABLE KEYS */;
INSERT INTO `company_profile` VALUES (1,'Maju Jaya Hotel Group','Jl. Diponegoro No. 123, Jakarta Pusat','021-1234567','majujaya@hotelgroup.com','7mj2k4x',NULL,'Pass@Maju2024'),(2,'Bintang Nusantara Hospitality','Jl. Ahmad Yani No. 456, Surabaya','031-2345678','bintangnusantara@hotelgroup.com','3bn4x9w',NULL,'BintangSecure88'),(3,'Pesona Pantai Resort','Jl. Pantai Kuta, Bali','0361-3456789','pesonapantai@hotelgroup.com','9pp1w5r',NULL,'PesonaBeach2026'),(4,'Pegunungan Indah Resort','Jl. Raya Bandung-Jakarta Km 50, Bandung','022-4567890','pegunungganindah@hotelgroup.com','2pi6r8t',NULL,'MountainStay123'),(5,'Kota Tua Heritage Hotels','Jl. Kota Tua No. 789, Jakarta Barat','021-5678901','kotatuaheritage@hotelgroup.com','5kt8y3m',NULL,'HeritageKota456'),(6,'Tropis Sejahtera Hotel','Jl. Sudirman No. 321, Medan','061-6789012','tropissejahtera@hotelgroup.com','4ts3m7n',NULL,'TropisMedan789');
/*!40000 ALTER TABLE `company_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id_customer` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  PRIMARY KEY (`id_customer`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Budi Santoso','budi.santoso@email.com','password123!','08123456789'),(2,'Siti Nurhaliza','siti.nurhaliza@email.com','password123!','08213456789'),(3,'Ahmad Wijaya','ahmad.wijaya@email.com','password123!','08312456789'),(4,'Dewi Lestari','dewi.lestari@email.com','password123!','08413456789'),(5,'Rendra Kusuma','rendra.kusuma@email.com','password123!','08513456789'),(6,'Eka Pratiwi','eka.pratiwi@email.com','password123!','08613456789'),(7,'Hendra Gunawan','hendra.gunawan@email.com','password123!','08713456789'),(8,'Indah Sari','indah.sari@email.com','password123!','08813456789'),(9,'Michael','mich@gmail.com','mich123','08121212232');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_login` AFTER INSERT ON `customer` FOR EACH ROW BEGIN

    INSERT INTO `activity_log` (

        id_user,

        user_type,

        activity_type,

        details,

        created_at

    ) VALUES (

        NEW.id_customer,

        'customer',

        'login',

        JSON_OBJECT(

            'email', NEW.email,

            'nama', NEW.name

        ),

        NOW()

    );

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_after_registrasi_customer` AFTER INSERT ON `customer` FOR EACH ROW BEGIN

    INSERT INTO `activity_log` (

        id_user,

        user_type,

        activity_type,

        details,

        created_at

    ) VALUES (

        NEW.id_customer,

        'customer',

        'registrasi',

        JSON_OBJECT(

            'email', NEW.email,

            'nama_lengkap', NEW.name,

            'nomor_telepon', NEW.phone_number

        ),

        NOW()

    );

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detail_kamar`
--

LOCK TABLES `detail_kamar` WRITE;
/*!40000 ALTER TABLE `detail_kamar` DISABLE KEYS */;
INSERT INTO `detail_kamar` VALUES (1,'Standard Room','Kamar standar dengan tempat tidur single','AC, TV LED 32 inch, Kamar mandi pribadi, WiFi gratis, Tempat tidur single',1),(2,'Double Room','Kamar dengan tempat tidur double bed','AC, TV LED 42 inch, Kamar mandi pribadi dengan shower, WiFi gratis, Tempat tidur double, Meja kerja',2),(3,'Twin Room','Kamar dengan dua tempat tidur single','AC, TV LED 40 inch, Kamar mandi pribadi dengan bathtub, WiFi gratis, Dua tempat tidur single',2),(4,'Suite Room','Kamar suite dengan ruang tamu terpisah','AC, TV LED 50 inch, Kamar mandi mewah, WiFi gratis, Ruang tamu, Tempat tidur king size, Mini bar',2),(5,'Deluxe Room','Kamar deluxe dengan pemandangan laut','AC, TV LED 46 inch, Kamar mandi premium, WiFi gratis, Balkon, Tempat tidur king size, Safe deposit box',2),(6,'Family Room','Kamar untuk keluarga dengan ruang yang luas','AC, TV LED 50 inch, 2 kamar mandi, WiFi gratis, Ruang tamu, 2 tempat tidur, Minibar',4),(7,'Standard Room','Kamar standar dengan tempat tidur single','AC, TV LED 32 inch, Kamar mandi pribadi, , Tempat tidur single',1),(8,'Double Room','Kamar dengan tempat tidur double bed','AC, TV LED 42 inch, Kamar mandi pribadi dengan shower, , Tempat tidur double, Meja kerja',2),(9,'Twin Room','Kamar dengan dua tempat tidur single','AC, TV LED 40 inch, Kamar mandi pribadi dengan bathtub, , Dua tempat tidur single',2),(10,'Suite Room','Kamar suite dengan ruang tamu terpisah','AC, TV LED 50 inch, Kamar mandi mewah, , Ruang tamu, Tempat tidur king size, Mini bar',2),(11,'Deluxe Room','Kamar deluxe dengan pemandangan laut','AC, TV LED 46 inch, Kamar mandi premium, , Balkon, Tempat tidur king size, Safe deposit box',2),(12,'Family Room','Kamar untuk keluarga dengan ruang yang luas','AC, TV LED 50 inch, 2 kamar mandi, , Ruang tamu, 2 tempat tidur, Minibar',4);
/*!40000 ALTER TABLE `detail_kamar` ENABLE KEYS */;
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
  `status` enum('confirmed','cancelled') DEFAULT 'confirmed',
  PRIMARY KEY (`id_history`),
  KEY `fk_history_user` (`id_user`),
  KEY `fk_history_company` (`id_company_profile`),
  KEY `fk_history_kamar` (`id_list_kamar`),
  CONSTRAINT `fk_history_company` FOREIGN KEY (`id_company_profile`) REFERENCES `company_profile` (`id_company_profile`),
  CONSTRAINT `fk_history_user` FOREIGN KEY (`id_user`) REFERENCES `user` (`id_user`),
  CONSTRAINT `fk_history_kamar` FOREIGN KEY (`id_list_kamar`) REFERENCES `list_kamar` (`id_list_kamar`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_purchase`
--

LOCK TABLES `history_purchase` WRITE;
/*!40000 ALTER TABLE `history_purchase` DISABLE KEYS */;
INSERT INTO `history_purchase` VALUES (1,1,1,1,'2026-03-01 10:00:00','2026-03-05 14:00:00','2026-03-07 11:00:00',700000.00,'confirmed'),(2,2,2,50,'2026-03-02 14:30:00','2026-03-06 15:00:00','2026-03-08 10:00:00',1050000.00,'confirmed'),(3,3,3,88,'2026-03-03 09:15:00','2026-03-07 16:00:00','2026-03-09 12:00:00',1600000.00,'confirmed'),(4,4,4,126,'2026-03-04 11:45:00','2026-03-05 14:00:00','2026-03-07 11:00:00',1750000.00,'confirmed');
/*!40000 ALTER TABLE `history_purchase` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_hotel`
--

LOCK TABLES `list_hotel` WRITE;
/*!40000 ALTER TABLE `list_hotel` DISABLE KEYS */;
INSERT INTO `list_hotel` VALUES (1,1,'Hotel Maju Jaya Jakarta Pusat','Jl. Diponegoro No. 123, Jakarta Pusat','Bapak Susanto','jakarta@majujaya.com','021-1111111'),(2,1,'Hotel Maju Jaya Suryakencana','Jl. Suryakencana No. 250, Jakarta Selatan','Ibu Siti','suryakencana@majujaya.com','021-2222222'),(3,2,'Bintang Nusantara Surabaya','Jl. Ahmad Yani No. 456, Surabaya','Bapak Hendra','surabaya@bintangnusantara.com','031-3333333'),(4,2,'Bintang Nusantara Lombok','Jl. Raya Lombok No. 789, Lombok Utara','Ibu Rina','lombok@bintangnusantara.com','0370-4444444'),(5,3,'Pesona Pantai Kuta Beach','Jl. Pantai Kuta No. 100, Bali','Bapak Agus','kuta@pesonapantai.com','0361-5555555'),(6,4,'Pegunungan Indah Bandung','Jl. Raya Bandung-Jakarta Km 50, Bandung','Ibu Maya','bandung@pegunungganindah.com','022-6666666'),(7,5,'Kota Tua Heritage Jakarta','Jl. Kota Tua No. 789, Jakarta Barat','Bapak Bambang','heritage@kotatua.com','021-7777777'),(8,6,'Tropis Sejahtera Medan','Jl. Sudirman No. 321, Medan','Ibu Lina','medan@tropissejahtera.com','061-8888888');
/*!40000 ALTER TABLE `list_hotel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `list_kamar`
--
set foreign ket 
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
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `list_kamar`
--

LOCK TABLES `list_kamar` WRITE;
/*!40000 ALTER TABLE `list_kamar` DISABLE KEYS */;
delete from list_kamar
where id_list_kamar != 1;

ALTER TABLE list_kamar AUTO_INCREMENT = 1;

INSERT INTO `list_kamar` VALUES (2,1,1,'A102',350000.00,'available'),(3,1,1,'A103',350000.00,'available'),(4,1,1,'A104',350000.00,'available'),(5,1,1,'A105',350000.00,'not available'),(6,1,2,'B101',500000.00,'available'),(7,1,2,'B102',500000.00,'available'),(8,1,2,'B103',500000.00,'available'),(9,1,2,'B104',500000.00,'available'),(10,1,2,'B105',500000.00,'not available'),(11,1,3,'C101',550000.00,'available'),(12,1,3,'C102',550000.00,'available'),(13,1,3,'C103',550000.00,'available'),(14,1,3,'C104',550000.00,'available'),(15,1,3,'C105',550000.00,'available'),(16,1,4,'D101',800000.00,'available'),(17,1,4,'D102',800000.00,'available'),(18,1,4,'D103',800000.00,'not available'),(19,1,5,'E101',750000.00,'available'),(20,1,5,'E102',750000.00,'available'),(21,1,5,'E103',750000.00,'available'),(22,1,5,'E104',750000.00,'available'),(23,1,6,'F101',1200000.00,'available'),(24,1,6,'F102',1200000.00,'available'),(25,1,6,'F103',1200000.00,'available'),(26,1,1,'A106',350000.00,'available'),(27,1,2,'B106',500000.00,'available'),(28,1,3,'C106',550000.00,'available'),(29,1,4,'D104',800000.00,'available'),(30,1,5,'E105',750000.00,'available'),(31,2,1,'A201',375000.00,'available'),(32,2,1,'A202',375000.00,'available'),(33,2,1,'A203',375000.00,'available'),(34,2,1,'A204',375000.00,'available'),(35,2,1,'A205',375000.00,'available'),(36,2,2,'B201',525000.00,'available'),(37,2,2,'B202',525000.00,'available'),(38,2,2,'B203',525000.00,'available'),(39,2,2,'B204',525000.00,'not available'),(40,2,2,'B205',525000.00,'available'),(41,2,3,'C201',575000.00,'available'),(42,2,3,'C202',575000.00,'available'),(43,2,3,'C203',575000.00,'available'),(44,2,3,'C204',575000.00,'available'),(45,2,3,'C205',575000.00,'available'),(46,2,4,'D201',825000.00,'available'),(47,2,4,'D202',825000.00,'available'),(48,2,4,'D203',825000.00,'available'),(49,2,5,'E201',775000.00,'available'),(50,2,5,'E202',775000.00,'available'),(51,2,5,'E203',775000.00,'not available'),(52,2,5,'E204',775000.00,'available'),(53,2,6,'F201',1250000.00,'available'),(54,2,6,'F202',1250000.00,'available'),(55,2,6,'F203',1250000.00,'available'),(56,2,1,'A206',375000.00,'available'),(57,2,2,'B206',525000.00,'available'),(58,2,3,'C206',575000.00,'available'),(59,2,4,'D204',825000.00,'available'),(60,2,5,'E205',775000.00,'available'),(61,2,1,'A207',375000.00,'available'),(62,2,2,'B207',525000.00,'available'),(63,2,3,'C207',575000.00,'available'),(64,2,4,'D205',825000.00,'available'),(65,2,5,'E206',775000.00,'available'),(66,3,1,'A301',400000.00,'available'),(67,3,1,'A302',400000.00,'available'),(68,3,1,'A303',400000.00,'available'),(69,3,1,'A304',400000.00,'available'),(70,3,1,'A305',400000.00,'available'),(71,3,1,'A306',400000.00,'available'),(72,3,2,'B301',550000.00,'available'),(73,3,2,'B302',550000.00,'available'),(74,3,2,'B303',550000.00,'available'),(75,3,2,'B304',550000.00,'available'),(76,3,2,'B305',550000.00,'not available'),(77,3,2,'B306',550000.00,'available'),(78,3,3,'C301',600000.00,'available'),(79,3,3,'C302',600000.00,'available'),(80,3,3,'C303',600000.00,'available'),(81,3,3,'C304',600000.00,'available'),(82,3,3,'C305',600000.00,'available'),(83,3,3,'C306',600000.00,'available'),(84,3,4,'D301',850000.00,'available'),(85,3,4,'D302',850000.00,'available'),(86,3,4,'D303',850000.00,'available'),(87,3,4,'D304',850000.00,'available'),(88,3,5,'E301',800000.00,'available'),(89,3,5,'E302',800000.00,'available'),(90,3,5,'E303',800000.00,'available'),(91,3,5,'E304',800000.00,'available'),(92,3,5,'E305',800000.00,'available'),(93,3,6,'F301',1300000.00,'available'),(94,3,6,'F302',1300000.00,'available'),(95,3,6,'F303',1300000.00,'available'),(96,3,1,'A307',400000.00,'available'),(97,3,2,'B307',550000.00,'available'),(98,3,3,'C307',600000.00,'available'),(99,3,4,'D305',850000.00,'available'),(100,3,5,'E306',800000.00,'available'),(101,3,1,'A308',400000.00,'not available'),(102,3,2,'B308',550000.00,'available'),(103,3,3,'C308',600000.00,'available'),(104,3,4,'D306',850000.00,'available'),(105,3,5,'E307',800000.00,'available'),(106,4,1,'A401',425000.00,'available'),(107,4,1,'A402',425000.00,'available'),(108,4,1,'A403',425000.00,'available'),(109,4,1,'A404',425000.00,'available'),(110,4,1,'A405',425000.00,'available'),(111,4,1,'A406',425000.00,'available'),(112,4,1,'A407',425000.00,'available'),(113,4,2,'B401',575000.00,'available'),(114,4,2,'B402',575000.00,'available'),(115,4,2,'B403',575000.00,'available'),(116,4,2,'B404',575000.00,'available'),(117,4,2,'B405',575000.00,'available'),(118,4,2,'B406',575000.00,'available'),(119,4,3,'C401',625000.00,'available'),(120,4,3,'C402',625000.00,'available'),(121,4,3,'C403',625000.00,'available'),(122,4,3,'C404',625000.00,'available'),(123,4,3,'C405',625000.00,'available'),(124,4,3,'C406',625000.00,'available'),(125,4,3,'C407',625000.00,'not available'),(126,4,4,'D401',875000.00,'available'),(127,4,4,'D402',875000.00,'available'),(128,4,4,'D403',875000.00,'available'),(129,4,4,'D404',875000.00,'available'),(130,4,4,'D405',875000.00,'available'),(131,4,5,'E401',825000.00,'available'),(132,4,5,'E402',825000.00,'available'),(133,4,5,'E403',825000.00,'available'),(134,4,5,'E404',825000.00,'available'),(135,4,5,'E405',825000.00,'available'),(136,4,5,'E406',825000.00,'available'),(137,4,6,'F401',1350000.00,'available'),(138,4,6,'F402',1350000.00,'available'),(139,4,6,'F403',1350000.00,'available'),(140,4,6,'F404',1350000.00,'available'),(141,4,1,'A408',425000.00,'available'),(142,4,2,'B407',575000.00,'available'),(143,4,3,'C408',625000.00,'available'),(144,4,4,'D406',875000.00,'available'),(145,4,5,'E407',825000.00,'available'),(146,4,1,'A409',425000.00,'available'),(147,4,2,'B408',575000.00,'available'),(148,4,3,'C409',625000.00,'available'),(149,4,4,'D407',875000.00,'available'),(150,4,5,'E408',825000.00,'available'),(151,5,1,'A501',450000.00,'available'),(152,5,1,'A502',450000.00,'available'),(153,5,1,'A503',450000.00,'available'),(154,5,1,'A504',450000.00,'available'),(155,5,1,'A505',450000.00,'available'),(156,5,1,'A506',450000.00,'available'),(157,5,1,'A507',450000.00,'available'),(158,5,1,'A508',450000.00,'not available'),(159,5,2,'B501',600000.00,'available'),(160,5,2,'B502',600000.00,'available'),(161,5,2,'B503',600000.00,'available'),(162,5,2,'B504',600000.00,'available'),(163,5,2,'B505',600000.00,'available'),(164,5,2,'B506',600000.00,'available'),(165,5,2,'B507',600000.00,'available'),(166,5,3,'C501',650000.00,'available'),(167,5,3,'C502',650000.00,'available'),(168,5,3,'C503',650000.00,'available'),(169,5,3,'C504',650000.00,'available'),(170,5,3,'C505',650000.00,'available'),(171,5,3,'C506',650000.00,'available'),(172,5,3,'C507',650000.00,'available'),(173,5,3,'C508',650000.00,'available'),(174,5,4,'D501',900000.00,'available'),(175,5,4,'D502',900000.00,'available'),(176,5,4,'D503',900000.00,'available'),(177,5,4,'D504',900000.00,'available'),(178,5,4,'D505',900000.00,'available'),(179,5,4,'D506',900000.00,'available'),(180,5,5,'E501',850000.00,'available'),(181,5,5,'E502',850000.00,'available'),(182,5,5,'E503',850000.00,'available'),(183,5,5,'E504',850000.00,'available'),(184,5,5,'E505',850000.00,'available'),(185,5,5,'E506',850000.00,'not available'),(186,5,5,'E507',850000.00,'available'),(187,5,5,'E508',850000.00,'available'),(188,5,6,'F501',1400000.00,'available'),(189,5,6,'F502',1400000.00,'available'),(190,5,6,'F503',1400000.00,'available'),(191,5,6,'F504',1400000.00,'available'),(192,5,6,'F505',1400000.00,'available'),(193,5,1,'A509',450000.00,'available'),(194,5,2,'B508',600000.00,'available'),(195,5,3,'C509',650000.00,'available'),(196,5,4,'D507',900000.00,'available'),(197,5,5,'E509',850000.00,'available'),(198,6,1,'A601',380000.00,'available'),(199,6,1,'A602',380000.00,'available'),(200,6,1,'A603',380000.00,'available'),(201,6,1,'A604',380000.00,'available'),(202,6,1,'A605',380000.00,'available'),(203,6,2,'B601',530000.00,'available'),(204,6,2,'B602',530000.00,'available'),(205,6,2,'B603',530000.00,'available'),(206,6,2,'B604',530000.00,'not available'),(207,6,2,'B605',530000.00,'available'),(208,6,3,'C601',580000.00,'available'),(209,6,3,'C602',580000.00,'available'),(210,6,3,'C603',580000.00,'available'),(211,6,3,'C604',580000.00,'available'),(212,6,3,'C605',580000.00,'available'),(213,6,4,'D601',830000.00,'available'),(214,6,4,'D602',830000.00,'available'),(215,6,4,'D603',830000.00,'available'),(216,6,5,'E601',780000.00,'available'),(217,6,5,'E602',780000.00,'available'),(218,6,5,'E603',780000.00,'available'),(219,6,5,'E604',780000.00,'available'),(220,6,6,'F601',1280000.00,'available'),(221,6,6,'F602',1280000.00,'available'),(222,6,6,'F603',1280000.00,'available'),(223,6,1,'A606',380000.00,'available'),(224,6,2,'B606',530000.00,'available'),(225,6,3,'C606',580000.00,'available'),(226,6,4,'D604',830000.00,'available'),(227,6,5,'E605',780000.00,'available'),(228,6,1,'A607',380000.00,'available'),(229,6,2,'B607',530000.00,'available'),(230,6,3,'C607',580000.00,'available'),(231,2,2,'B208',525000.00,'available');
/*!40000 ALTER TABLE `list_kamar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `session_login`
--

DROP TABLE IF EXISTS `session_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `session_login` (
  `id_login` int NOT NULL AUTO_INCREMENT,
  `id_user` int NOT NULL,
  `user_type` enum('admin','mitra','customer') DEFAULT 'customer',
  `status` enum('active','inactive') DEFAULT 'active',
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity` datetime DEFAULT CURRENT_TIMESTAMP,
  `logout_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id_login`),
  KEY `idx_id_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `session_login`
--

LOCK TABLES `session_login` WRITE;
/*!40000 ALTER TABLE `session_login` DISABLE KEYS */;
INSERT INTO `session_login` VALUES (1,9,'customer','active','2026-04-11 15:05:12','2026-04-11 15:05:12',NULL);
/*!40000 ALTER TABLE `session_login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_melihat_user`
--

DROP TABLE IF EXISTS `v_melihat_user`;
/*!50001 DROP VIEW IF EXISTS `v_melihat_user`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_melihat_user` AS SELECT 
 1 AS `id_customer`,
 1 AS `name`,
 1 AS `phone_number`,
 1 AS `email`,
 1 AS `purchase_date`,
 1 AS `checkin_time`,
 1 AS `checkout_time`,
 1 AS `amount`,
 1 AS `room_number`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_melihat_user`
--

/*!50001 DROP VIEW IF EXISTS `v_melihat_user`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_melihat_user` AS select `c`.`id_customer` AS `id_customer`,`c`.`name` AS `name`,`c`.`phone_number` AS `phone_number`,`c`.`email` AS `email`,`h`.`purchase_date` AS `purchase_date`,`h`.`checkin_time` AS `checkin_time`,`h`.`checkout_time` AS `checkout_time`,`h`.`amount` AS `amount`,`lk`.`room_number` AS `room_number` from ((`customer` `c` join `history_purchase` `h` on((`c`.`id_customer` = `h`.`id_customer`))) join `list_kamar` `lk` on((`h`.`id_list_kamar` = `lk`.`id_list_kamar`))) where (`h`.`status` = 'confirmed') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-18 14:04:11
