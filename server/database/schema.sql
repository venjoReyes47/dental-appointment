CREATE DATABASE IF NOT EXISTS dental_clinic
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dental_clinic;

CREATE TABLE IF NOT EXISTS roles (
  RoleId INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Description VARCHAR(100) NOT NULL,
  DateCreated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  DateUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (RoleId),
  UNIQUE KEY uq_roles_description (Description)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  UserId INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Email VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  Gender VARCHAR(20) NULL,
  Phone VARCHAR(30) NULL,
  BirthDate DATE NULL,
  IsActive TINYINT(1) NOT NULL DEFAULT 1,
  DateUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (UserId),
  UNIQUE KEY uq_users_email (Email),
  KEY ix_users_name (LastName, FirstName)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_roles (
  UserRoleId INT UNSIGNED NOT NULL AUTO_INCREMENT,
  UserId INT UNSIGNED NOT NULL,
  RoleId INT UNSIGNED NOT NULL DEFAULT 2,
  DateUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (UserRoleId),
  UNIQUE KEY uq_user_roles_user (UserId),
  KEY ix_user_roles_role (RoleId),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (UserId) REFERENCES users(UserId) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (RoleId) REFERENCES roles(RoleId) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  ServiceId INT UNSIGNED NOT NULL AUTO_INCREMENT,
  Description VARCHAR(255) NOT NULL,
  DateCreated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  DateUpdated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (ServiceId),
  UNIQUE KEY uq_services_description (Description)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS appointments (
  AppointmentId INT UNSIGNED NOT NULL AUTO_INCREMENT,
  AppointmentDate DATETIME NOT NULL,
  PatientUserId INT UNSIGNED NOT NULL,
  DentistUserId INT UNSIGNED NOT NULL,
  ServiceId INT UNSIGNED NOT NULL,
  Status ENUM('P','C','D','X') NOT NULL DEFAULT 'P',
  Notes VARCHAR(1000) NULL,
  PRIMARY KEY (AppointmentId),
  KEY ix_appointments_date (AppointmentDate),
  KEY ix_appointments_patient_date (PatientUserId, AppointmentDate),
  KEY ix_appointments_dentist_date (DentistUserId, AppointmentDate),
  KEY ix_appointments_service (ServiceId),
  CONSTRAINT fk_appointments_patient FOREIGN KEY (PatientUserId) REFERENCES users(UserId) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_dentist FOREIGN KEY (DentistUserId) REFERENCES users(UserId) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_service FOREIGN KEY (ServiceId) REFERENCES services(ServiceId) ON DELETE RESTRICT
) ENGINE=InnoDB;

INSERT INTO roles (RoleId, Description)
VALUES (1, 'Dentist'), (2, 'Patient')
ON DUPLICATE KEY UPDATE Description = VALUES(Description);

INSERT INTO services (Description)
VALUES ('Dental Cleaning'), ('Tooth Extraction'), ('Dental Consultation'), ('Teeth Whitening'), ('Dental Filling')
ON DUPLICATE KEY UPDATE Description = VALUES(Description);
