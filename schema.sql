-- ====================================================================
-- STUDENT ATTENDANCE ANALYZER ULTIMATE - MYSQL DATABASE SCHEMA
-- ====================================================================
-- Production Relational Schema for Enterprise Academic Suite
-- Includes Users, Students, Faculty, Subjects, Attendance, Edits with Reason, Leaves, Timetable & Audit Logs

CREATE DATABASE IF NOT EXISTS attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE attendance_db;

-- --------------------------------------------------------------------
-- 1. USERS TABLE (Authentication & Role Management)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'faculty', 'student') NOT NULL DEFAULT 'student',
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    phone VARCHAR(32) DEFAULT NULL,
    status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. DEPARTMENTS & SUBJECTS / COURSES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    code VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    department VARCHAR(64) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    semester INT NOT NULL DEFAULT 1,
    min_threshold INT NOT NULL DEFAULT 75,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 3. FACULTY PROFILES
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id VARCHAR(32) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    department VARCHAR(64) NOT NULL,
    designation VARCHAR(64) DEFAULT 'Assistant Professor',
    email VARCHAR(128) NOT NULL,
    phone VARCHAR(32) DEFAULT NULL,
    office_room VARCHAR(32) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 4. FACULTY SUBJECT ASSIGNMENTS (FACULTY SEES ONLY ASSIGNED SUBJECTS)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    faculty_id VARCHAR(32) NOT NULL,
    subject_code VARCHAR(32) NOT NULL,
    section VARCHAR(16) NOT NULL DEFAULT 'A',
    academic_year VARCHAR(16) NOT NULL DEFAULT '2025-2026',
    semester INT NOT NULL DEFAULT 1,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_faculty_subj_sec (faculty_id, subject_code, section, academic_year, semester),
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 5. STUDENTS ROSTER
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    roll_number VARCHAR(32) PRIMARY KEY,
    user_id INT DEFAULT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    department VARCHAR(64) NOT NULL DEFAULT 'Computer Science',
    section VARCHAR(16) NOT NULL DEFAULT 'A',
    semester INT NOT NULL DEFAULT 1,
    email VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    parent_phone VARCHAR(32) DEFAULT NULL,
    admission_year INT DEFAULT 2024,
    status ENUM('active', 'graduated', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_dept_sec (department, section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 6. ATTENDANCE SESSIONS (Class Sessions Conducted by Faculty)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(32) NOT NULL,
    faculty_id VARCHAR(32) NOT NULL,
    session_date DATE NOT NULL,
    period_slot VARCHAR(32) NOT NULL DEFAULT 'Period 1 (09:00 - 10:00)',
    room_no VARCHAR(32) DEFAULT 'Room 301',
    topic_covered VARCHAR(255) DEFAULT 'Regular Lecture',
    gps_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_subj_date_period (subject_code, session_date, period_slot),
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    INDEX idx_session_date (session_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 7. ATTENDANCE RECORDS (Per-Student Attendance Marks)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT NOT NULL,
    student_id VARCHAR(32) NOT NULL,
    subject_code VARCHAR(32) NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Leave', 'Late') NOT NULL DEFAULT 'Absent',
    marked_by VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_session_student (session_id, student_id),
    FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(roll_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE,
    INDEX idx_student_subject (student_id, subject_code),
    INDEX idx_att_date (attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 8. ATTENDANCE EDITS AUDIT (Mandatory Reason Field Log)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_edits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    attendance_record_id INT NOT NULL,
    student_id VARCHAR(32) NOT NULL,
    subject_code VARCHAR(32) NOT NULL,
    session_date DATE NOT NULL,
    old_status ENUM('Present', 'Absent', 'Leave', 'Late') NOT NULL,
    new_status ENUM('Present', 'Absent', 'Leave', 'Late') NOT NULL,
    reason TEXT NOT NULL,
    edited_by_faculty_id VARCHAR(32) NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (attendance_record_id) REFERENCES attendance_records(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(roll_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE,
    INDEX idx_edit_student (student_id),
    INDEX idx_edit_faculty (edited_by_faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 9. LEAVE MANAGEMENT PORTAL (Student Requests & Faculty Approval)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(32) NOT NULL,
    subject_code VARCHAR(32) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type ENUM('Medical', 'On Duty', 'Personal', 'Emergency') NOT NULL DEFAULT 'Medical',
    reason TEXT NOT NULL,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by VARCHAR(32) DEFAULT NULL,
    review_comment TEXT DEFAULT NULL,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (student_id) REFERENCES students(roll_number) ON DELETE CASCADE,
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE,
    INDEX idx_leave_student (student_id),
    INDEX idx_leave_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 10. TIMETABLE SCHEDULE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') NOT NULL,
    period_number INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_code VARCHAR(32) NOT NULL,
    faculty_id VARCHAR(32) NOT NULL,
    room VARCHAR(32) NOT NULL DEFAULT 'Room 301',
    section VARCHAR(16) NOT NULL DEFAULT 'A',
    FOREIGN KEY (subject_code) REFERENCES subjects(code) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    INDEX idx_day_period (day_of_week, period_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 11. AUDIT LOGS (Security & Compliance Trail)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    user_role VARCHAR(32) NOT NULL,
    user_name VARCHAR(64) NOT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_event (event_type),
    INDEX idx_audit_time (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
