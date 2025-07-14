-- Hacker Experience Modern Database Schema
-- Based on the original Hacker Experience Legacy

CREATE DATABASE IF NOT EXISTS hacker_experience;
USE hacker_experience;

-- Users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  ip VARCHAR(45) NOT NULL,
  rank INT DEFAULT 1,
  experience BIGINT DEFAULT 0,
  money BIGINT DEFAULT 1000,
  bitcoins DECIMAL(12,7) DEFAULT 0.0000000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_online BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP NULL
);

-- Hardware table (PCs/Servers)
CREATE TABLE hardware (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('PC', 'SERVER', 'LAPTOP') DEFAULT 'PC',
  cpu_level INT DEFAULT 1,
  ram_level INT DEFAULT 1,
  hdd_level INT DEFAULT 1,
  internet_level INT DEFAULT 1,
  firewall_level INT DEFAULT 0,
  antivirus_level INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Software table
CREATE TABLE software (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type ENUM('HACK', 'DOWNLOAD', 'UPLOAD', 'DELETE', 'HIDE', 'SEEK', 'AV', 'LOG', 'FORMAT', 'INSTALL', 'UNINSTALL', 'PORT_SCAN', 'RESEARCH', 'NMAP', 'ANALYZE', 'DOOM', 'RESET_IP', 'RESET_PWD', 'DDOS', 'WEBSERVER', 'FOLDER', 'TEXT') NOT NULL,
  level INT DEFAULT 1,
  price INT DEFAULT 0,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- User software inventory
CREATE TABLE user_software (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  software_id INT NOT NULL,
  hardware_id INT NOT NULL,
  folder_id INT DEFAULT NULL,
  is_installed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (software_id) REFERENCES software(id) ON DELETE CASCADE,
  FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE
);

-- Folders
CREATE TABLE folders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  hardware_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE
);

-- Text files
CREATE TABLE text_files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  hardware_id INT NOT NULL,
  folder_id INT DEFAULT NULL,
  name VARCHAR(100) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);

-- Internet connections (NPCs and other players)
CREATE TABLE internet_connections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ip VARCHAR(45) NOT NULL,
  type ENUM('NPC', 'PLAYER') DEFAULT 'NPC',
  user_id INT DEFAULT NULL,
  name VARCHAR(100),
  level INT DEFAULT 1,
  firewall_level INT DEFAULT 0,
  antivirus_level INT DEFAULT 0,
  is_online BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Processes (running tasks)
CREATE TABLE processes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  hardware_id INT NOT NULL,
  software_id INT NOT NULL,
  target_ip VARCHAR(45) DEFAULT NULL,
  type ENUM('DOWNLOAD', 'UPLOAD', 'DELETE', 'HIDE', 'SEEK', 'AV', 'LOG', 'FORMAT', 'HACK', 'BANK_HACK', 'INSTALL', 'UNINSTALL', 'PORT_SCAN', 'RESEARCH', 'NMAP', 'ANALYZE', 'DOOM', 'RESET_IP', 'RESET_PWD', 'DDOS', 'INSTALL_WEBSERVER') NOT NULL,
  status ENUM('RUNNING', 'COMPLETED', 'FAILED', 'PAUSED') DEFAULT 'RUNNING',
  progress INT DEFAULT 0,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  result TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE,
  FOREIGN KEY (software_id) REFERENCES software(id) ON DELETE CASCADE
);

-- Missions
CREATE TABLE missions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('STORYLINE', 'SIDE', 'DAILY') DEFAULT 'SIDE',
  difficulty INT DEFAULT 1,
  reward_money INT DEFAULT 0,
  reward_experience INT DEFAULT 0,
  reward_software_id INT DEFAULT NULL,
  requirements JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reward_software_id) REFERENCES software(id) ON DELETE SET NULL
);

-- User missions
CREATE TABLE user_missions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  mission_id INT NOT NULL,
  status ENUM('AVAILABLE', 'IN_PROGRESS', 'COMPLETED', 'FAILED') DEFAULT 'AVAILABLE',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  progress JSON,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (mission_id) REFERENCES missions(id) ON DELETE CASCADE
);

-- Bank accounts
CREATE TABLE bank_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account_number BIGINT UNIQUE NOT NULL,
  password VARCHAR(6) NOT NULL,
  user_id INT NOT NULL,
  balance BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bitcoin wallets
CREATE TABLE bitcoin_wallets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  address VARCHAR(34) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  private_key VARCHAR(64) NOT NULL,
  balance DECIMAL(12,7) DEFAULT 0.0000000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Logs (system logs)
CREATE TABLE logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  hardware_id INT NOT NULL,
  type ENUM('LOGIN', 'LOGOUT', 'HACK', 'DOWNLOAD', 'UPLOAD', 'DELETE', 'INSTALL', 'UNINSTALL', 'ERROR') NOT NULL,
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (hardware_id) REFERENCES hardware(id) ON DELETE CASCADE
);

-- Clans
CREATE TABLE clans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  tag VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  leader_id INT NOT NULL,
  money BIGINT DEFAULT 0,
  experience BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Clan members
CREATE TABLE clan_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clan_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('LEADER', 'OFFICER', 'MEMBER') DEFAULT 'MEMBER',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_clan_member (clan_id, user_id)
);

-- Insert default software
INSERT INTO software (name, type, level, price, description, is_public) VALUES
('Basic Hacker', 'HACK', 1, 100, 'Basic hacking tool', TRUE),
('Port Scanner', 'PORT_SCAN', 1, 50, 'Scan for open ports', TRUE),
('File Downloader', 'DOWNLOAD', 1, 75, 'Download files from remote systems', TRUE),
('File Uploader', 'UPLOAD', 1, 75, 'Upload files to remote systems', TRUE),
('File Deleter', 'DELETE', 1, 100, 'Delete files from remote systems', TRUE),
('File Hider', 'HIDE', 1, 150, 'Hide files on remote systems', TRUE),
('File Seeker', 'SEEK', 1, 50, 'Find hidden files', TRUE),
('Basic Antivirus', 'AV', 1, 200, 'Basic antivirus protection', TRUE),
('Log Viewer', 'LOG', 1, 25, 'View system logs', TRUE),
('Disk Formatter', 'FORMAT', 1, 500, 'Format hard drives', TRUE),
('Software Installer', 'INSTALL', 1, 25, 'Install software', TRUE),
('Software Uninstaller', 'UNINSTALL', 1, 25, 'Uninstall software', TRUE),
('Network Mapper', 'NMAP', 1, 100, 'Advanced network scanning', TRUE),
('System Analyzer', 'ANALYZE', 1, 150, 'Analyze system specifications', TRUE),
('IP Reset Tool', 'RESET_IP', 1, 1000, 'Reset your IP address', TRUE),
('Password Reset Tool', 'RESET_PWD', 1, 500, 'Reset passwords', TRUE),
('DDoS Tool', 'DDOS', 1, 2000, 'Distributed Denial of Service tool', TRUE),
('Web Server', 'WEBSERVER', 1, 1500, 'Host web content', TRUE);

-- Insert default missions
INSERT INTO missions (title, description, type, difficulty, reward_money, reward_experience) VALUES
('Welcome to the Matrix', 'Complete the tutorial and learn the basics of hacking.', 'STORYLINE', 1, 500, 100),
('First Hack', 'Successfully hack your first target.', 'STORYLINE', 1, 1000, 200),
('Software Collection', 'Download and install your first software.', 'SIDE', 1, 300, 50),
('Money Matters', 'Earn your first $10,000.', 'SIDE', 2, 2000, 300),
('Advanced Scanning', 'Use NMAP to scan a target system.', 'SIDE', 2, 500, 100);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_hardware_user_id ON hardware(user_id);
CREATE INDEX idx_software_type ON software(type);
CREATE INDEX idx_user_software_user_id ON user_software(user_id);
CREATE INDEX idx_processes_user_id ON processes(user_id);
CREATE INDEX idx_processes_status ON processes(status);
CREATE INDEX idx_internet_connections_ip ON internet_connections(ip);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);