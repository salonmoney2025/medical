-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: student_medical_system
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '62266fda-fc7d-11f0-99e6-98e7435eb374:1-176';

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `initiator` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'success',
  `role` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_action` (`action`),
  KEY `idx_initiator` (`initiator`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
INSERT INTO `system_logs` VALUES (1,'System Setup','system','success','super_admin',NULL,NULL,'Database tables created and super admin account initialized','2026-01-29 10:18:00'),(2,'Login Admin','superadmin@ebkustsl.edu.sl','success','super_admin',NULL,NULL,'User Super Administrator logged in successfully','2026-01-29 10:18:13'),(3,'System Setup','system','success','super_admin',NULL,NULL,'Database tables created and super admin account initialized','2026-01-29 10:21:30'),(4,'Reset Password','super_admin','success','super_admin',NULL,NULL,'Password reset for admin@ebkustsl.edu.sl (Michael)','2026-01-29 10:40:18'),(5,'Login Admin','admin@ebkustsl.edu.sl','success','medical_officer',NULL,NULL,'User Michael logged in successfully','2026-01-29 10:40:29'),(6,'Create Medical Report','admin@ebkustsl.edu.sl','success','medical_officer',NULL,NULL,NULL,'2026-01-29 16:09:03'),(7,'Batch Upload Students','superadmin@ebkustsl.edu.sl','success','super_admin',NULL,NULL,'Uploaded 1314 students, skipped 0. Academic year: 2025/2026','2026-01-29 16:40:17'),(8,'Reset Student Password','super_admin','success','super_admin',NULL,NULL,'Password reset for student NAOMI SENTO BANGURA (APPID: 27321)','2026-01-29 18:10:33'),(9,'Reset Password','super_admin','success','super_admin',NULL,NULL,'Password reset for superadmin@ebkustsl.edu.sl (Super Administrator)','2026-01-29 18:13:19'),(10,'Login Admin','superadmin@ebkustsl.edu.sl','success','super_admin',NULL,NULL,'User Super Administrator logged in successfully','2026-01-29 18:13:30'),(11,'Login Admin','superadmin@ebkustsl.edu.sl','success','super_admin',NULL,NULL,'User Super Administrator logged in successfully','2026-01-29 18:13:36'),(12,'Login Admin','superadmin@ebkustsl.edu.sl','success','super_admin',NULL,NULL,'User Super Administrator logged in successfully','2026-01-29 18:17:38'),(13,'Login Admin','superadmin@ebkustsl.edu.sl','success','super_admin',NULL,NULL,'User Super Administrator logged in successfully','2026-01-29 20:43:37');
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-29 21:57:51
