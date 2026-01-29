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
-- Temporary view structure for view `medical_records_view`
--

DROP TABLE IF EXISTS `medical_records_view`;
/*!50001 DROP VIEW IF EXISTS `medical_records_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `medical_records_view` AS SELECT 
 1 AS `id`,
 1 AS `student_id`,
 1 AS `medical_officer_id`,
 1 AS `weight`,
 1 AS `height`,
 1 AS `visual_acuity_le`,
 1 AS `visual_acuity_re`,
 1 AS `blood_group`,
 1 AS `past_medical_history`,
 1 AS `current_chronic_illness`,
 1 AS `long_standing_medication`,
 1 AS `known_allergies`,
 1 AS `respiratory_breast_exam`,
 1 AS `cardiovascular_exam`,
 1 AS `mental_state_exam`,
 1 AS `additional_notes`,
 1 AS `is_completed`,
 1 AS `created_at`,
 1 AS `updated_at`,
 1 AS `completed_at`,
 1 AS `student_name`,
 1 AS `matriculation_number`,
 1 AS `program`,
 1 AS `faculty`,
 1 AS `department`,
 1 AS `medical_officer_name`,
 1 AS `medical_officer_email`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `medical_records_view`
--

/*!50001 DROP VIEW IF EXISTS `medical_records_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb3 */;
/*!50001 SET character_set_results     = utf8mb3 */;
/*!50001 SET collation_connection      = utf8mb3_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `medical_records_view` AS select `mr`.`id` AS `id`,`mr`.`student_id` AS `student_id`,`mr`.`medical_officer_id` AS `medical_officer_id`,`mr`.`weight` AS `weight`,`mr`.`height` AS `height`,`mr`.`visual_acuity_le` AS `visual_acuity_le`,`mr`.`visual_acuity_re` AS `visual_acuity_re`,`mr`.`blood_group` AS `blood_group`,`mr`.`past_medical_history` AS `past_medical_history`,`mr`.`current_chronic_illness` AS `current_chronic_illness`,`mr`.`long_standing_medication` AS `long_standing_medication`,`mr`.`known_allergies` AS `known_allergies`,`mr`.`respiratory_breast_exam` AS `respiratory_breast_exam`,`mr`.`cardiovascular_exam` AS `cardiovascular_exam`,`mr`.`mental_state_exam` AS `mental_state_exam`,`mr`.`additional_notes` AS `additional_notes`,`mr`.`is_completed` AS `is_completed`,`mr`.`created_at` AS `created_at`,`mr`.`updated_at` AS `updated_at`,`mr`.`completed_at` AS `completed_at`,`s`.`name` AS `student_name`,`s`.`matriculation_number` AS `matriculation_number`,`s`.`program` AS `program`,`s`.`faculty` AS `faculty`,`s`.`department` AS `department`,`u`.`full_name` AS `medical_officer_name`,`u`.`email` AS `medical_officer_email` from ((`medical_records` `mr` join `students` `s` on((`mr`.`student_id` = `s`.`id`))) join `users` `u` on((`mr`.`medical_officer_id` = `u`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
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
