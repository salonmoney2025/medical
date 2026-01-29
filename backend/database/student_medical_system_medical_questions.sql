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
-- Table structure for table `medical_questions`
--

DROP TABLE IF EXISTS `medical_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `medical_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_type` enum('text','textarea','dropdown','checkbox','number') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_required` tinyint(1) DEFAULT '0',
  `options` json DEFAULT NULL,
  `display_order` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `medical_questions`
--

LOCK TABLES `medical_questions` WRITE;
/*!40000 ALTER TABLE `medical_questions` DISABLE KEYS */;
INSERT INTO `medical_questions` VALUES (1,'Weight (kg)','number',1,NULL,1,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(2,'Height (cm)','number',1,NULL,2,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(3,'Visual Acuity - Left Eye (LE)','text',1,NULL,3,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(4,'Visual Acuity - Right Eye (RE)','text',1,NULL,4,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(5,'Blood Group','dropdown',0,'[\"A+\", \"A-\", \"B+\", \"B-\", \"AB+\", \"AB-\", \"O+\", \"O-\", \"Unknown\"]',5,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(6,'Past Medical History / Current and present chronic illness','textarea',0,NULL,6,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(7,'Long Standing Medication','textarea',0,NULL,7,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(8,'Any Known Allergy','textarea',0,NULL,8,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(9,'Respiratory and Breast Examination (if required)','textarea',0,NULL,9,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(10,'Cardiovascular Examination (Hypertensive or any indication)','textarea',0,NULL,10,1,'2026-01-28 19:51:37','2026-01-28 19:51:37'),(11,'Mental State Examination','textarea',0,NULL,11,1,'2026-01-28 19:51:37','2026-01-28 19:51:37');
/*!40000 ALTER TABLE `medical_questions` ENABLE KEYS */;
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
