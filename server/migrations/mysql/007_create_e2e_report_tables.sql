-- Create E2E Report Summary table
CREATE TABLE IF NOT EXISTS e2e_report_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL UNIQUE COMMENT 'Report date in YYYY-MM-DD format (UTC)',
    status ENUM('ready', 'pending', 'failed') NOT NULL DEFAULT 'pending',
    total_runs INT NOT NULL DEFAULT 0,
    passed_runs INT NOT NULL DEFAULT 0,
    failed_runs INT NOT NULL DEFAULT 0,
    success_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000 COMMENT 'Value between 0 and 1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create E2E Report Detail table
CREATE TABLE IF NOT EXISTS e2e_report_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_summary_id INT NOT NULL,
    app_id INT NOT NULL,
    total_runs INT NOT NULL DEFAULT 0,
    passed_runs INT NOT NULL DEFAULT 0,
    failed_runs INT NOT NULL DEFAULT 0,
    success_rate DECIMAL(5, 4) NOT NULL DEFAULT 0.0000 COMMENT 'Value between 0 and 1',
    last_run_status VARCHAR(50) NOT NULL,
    last_failed_run_at TIMESTAMP NULL DEFAULT NULL COMMENT 'ISO date string or null',
    last_run_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (report_summary_id) REFERENCES e2e_report_summaries(id) ON DELETE CASCADE,
    FOREIGN KEY (app_id) REFERENCES apps(id) ON DELETE CASCADE,
    INDEX idx_report_summary_id (report_summary_id),
    INDEX idx_app_id (app_id),
    INDEX idx_last_run_at (last_run_at),
    UNIQUE KEY unique_report_app (report_summary_id, app_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

