
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
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
