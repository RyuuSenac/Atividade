    DROP DATABASE IF EXISTS atividade;

    CREATE DATABASE atividade;

    use atividade;

    CREATE TABLE usuarios(
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        senha VARCHAR(255) NULL,
        role ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
        google_id VARCHAR(255) NULL UNIQUE,
        provedor ENUM('local', 'google') NOT NULL DEFAULT 'local',
        foto VARCHAR(500) NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    
    CREATE TABLE enderecos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL UNIQUE,
        cep CHAR(8) NOT NULL,
        logradouro VARCHAR(150) NOT NULL,
        numero VARCHAR(10) NOT NULL,
        complemento VARCHAR(100) NULL,
        bairro VARCHAR(100) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        uf CHAR(2) NOT NULL,
        CONSTRAINT fk_enderecos_usuarios
            FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            ON DELETE CASCADE
    );
