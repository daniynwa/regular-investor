-- =============================================================
-- Regular Investor — Database Schema
-- MySQL / MariaDB
-- =============================================================

CREATE DATABASE IF NOT EXISTS regular_investor
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE regular_investor;

-- -------------------------------------------------------------
-- articles
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS articles (
  id          INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  title       VARCHAR(512)     NOT NULL,
  excerpt     TEXT             NOT NULL,
  content     LONGTEXT         DEFAULT NULL,
  category    ENUM(
                'Economics','Investment','Nasional',
                'Global','Technology','Business'
              )                NOT NULL,
  tag         VARCHAR(100)     DEFAULT NULL,
  date        DATE             NOT NULL,
  slug        VARCHAR(200)     NOT NULL,
  image       VARCHAR(1024)    DEFAULT NULL,
  featured    TINYINT(1)       NOT NULL DEFAULT 0,
  read_time   TINYINT UNSIGNED DEFAULT 5,
  created_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_slug (slug),
  KEY idx_category (category),
  KEY idx_date     (date DESC),
  KEY idx_featured (featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
