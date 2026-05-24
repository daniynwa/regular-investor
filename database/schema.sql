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

-- -------------------------------------------------------------
-- admin_users — email/password authenticated admins
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)     NOT NULL,
  password_hash VARCHAR(255)     NOT NULL,
  name          VARCHAR(100)     DEFAULT NULL,
  status        ENUM('pending','active','disabled') NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------
-- site_settings — key/value store for admin-managed settings
-- (social links, site config, etc.)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  setting_key   VARCHAR(100)     NOT NULL,
  setting_value TEXT             DEFAULT NULL,
  updated_at    TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default social media settings
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
  ('social_facebook',  ''),
  ('social_twitter',   ''),
  ('social_instagram', ''),
  ('social_youtube',   ''),
  ('social_telegram',  '');

