-- SupportDesk Pro development-only schema.
-- Manually run this file against a local MySQL 8 instance only.
-- It creates no sample rows and does not alter or drop existing tables.
CREATE DATABASE IF NOT EXISTS supportdesk_pro_dev
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'supportdesk_dev'@'127.0.0.1'
  IDENTIFIED BY 'CHANGE_ME_LOCAL_ONLY';

GRANT SELECT, INSERT, UPDATE, DELETE
  ON supportdesk_pro_dev.*
  TO 'supportdesk_dev'@'127.0.0.1';

USE supportdesk_pro_dev;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL DEFAULT '',
    department VARCHAR(150) NOT NULL DEFAULT '',
    role ENUM('Administrador', 'Técnico', 'Solicitante') NOT NULL,
    store_id INT UNSIGNED NULL,
    status ENUM('Ativo', 'Inativo') NOT NULL DEFAULT 'Ativo',
    created_at DATETIME NOT NULL,
    must_change_password TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    KEY idx_users_store_id (store_id),
    KEY idx_users_status (status),
    KEY idx_users_role (role)
) ENGINE=InnoDB
  ROW_FORMAT=DYNAMIC
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supportdesk_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    entity_type VARCHAR(40) NOT NULL,
    owner_user_id INT UNSIGNED NULL,
    payload JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_supportdesk_records_type_id (entity_type, id),
    KEY idx_supportdesk_records_owner (entity_type, owner_user_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
