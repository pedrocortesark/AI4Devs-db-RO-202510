-- ============================================================================
-- ATS (Applicant Tracking System) Database Schema - PostgreSQL
-- ============================================================================
-- Author: Pedro Cortes
-- Project: AI4Devs-db-RO-202510
-- Date: 2025-12-16
-- Version: 2.0
-- Description: Complete DDL script for ATS database with normalization to 3NF,
--              comprehensive indexing, triggers, and constraints.
-- ============================================================================

-- PostgreSQL Configuration
SET client_encoding = 'UTF8';
SET timezone = 'UTC';
SET standard_conforming_strings = on;

-- ============================================================================
-- 1. CREATE ENUMS (Custom Types)
-- ============================================================================

CREATE TYPE employee_role AS ENUM (
    'ADMIN',
    'RECRUITER',
    'INTERVIEWER',
    'MANAGER'
);

CREATE TYPE position_status AS ENUM (
    'DRAFT',
    'OPEN',
    'CLOSED',
    'ON_HOLD'
);

CREATE TYPE employment_type AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'CONTRACT',
    'INTERNSHIP'
);

CREATE TYPE application_status AS ENUM (
    'PENDING',
    'REVIEWING',
    'INTERVIEWING',
    'ACCEPTED',
    'REJECTED',
    'WITHDRAWN'
);

CREATE TYPE interview_result AS ENUM (
    'PENDING',
    'PASSED',
    'FAILED',
    'NO_SHOW'
);

CREATE TYPE file_type AS ENUM (
    'PDF',
    'DOCX',
    'DOC',
    'TXT',
    'RTF'
);

CREATE TYPE company_size AS ENUM (
    'STARTUP',
    'SMALL',
    'MEDIUM',
    'LARGE',
    'ENTERPRISE'
);

CREATE TYPE application_source AS ENUM (
    'WEBSITE',
    'LINKEDIN',
    'INDEED',
    'GLASSDOOR',
    'REFERRAL',
    'RECRUITER',
    'CAREER_FAIR',
    'OTHER'
);

CREATE TYPE education_level AS ENUM (
    'HIGH_SCHOOL',
    'ASSOCIATE',
    'BACHELOR',
    'MASTER',
    'PHD',
    'CERTIFICATE',
    'BOOTCAMP'
);

-- ============================================================================
-- 2. CREATE TABLES (In dependency order)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 Industry (Catalog Table - No dependencies)
-- ----------------------------------------------------------------------------
CREATE TABLE industry (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE industry IS 'Catalog of industries/sectors for company categorization';
COMMENT ON COLUMN industry.name IS 'Unique industry name (e.g., Technology, Finance, Healthcare)';

-- ----------------------------------------------------------------------------
-- 2.2 Company (Depends on: Industry)
-- ----------------------------------------------------------------------------
CREATE TABLE company (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    website     VARCHAR(255),
    industry_id INTEGER,
    size        company_size,
    logo_url    VARCHAR(500),
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_company_industry 
        FOREIGN KEY (industry_id) 
        REFERENCES industry(id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE company IS 'Companies that post job positions and manage recruitment';
COMMENT ON COLUMN company.name IS 'Unique company name';
COMMENT ON COLUMN company.size IS 'Company size classification';

-- ----------------------------------------------------------------------------
-- 2.3 Employee (Depends on: Company)
-- ----------------------------------------------------------------------------
CREATE TABLE employee (
    id         SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    name       VARCHAR(255) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    phone      VARCHAR(20),
    job_title  VARCHAR(100),
    department VARCHAR(100),
    role       employee_role NOT NULL,
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_employee_company 
        FOREIGN KEY (company_id) 
        REFERENCES company(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE employee IS 'Employees/recruiters who manage positions and conduct interviews';
COMMENT ON COLUMN employee.role IS 'Employee role in the recruitment process';
COMMENT ON COLUMN employee.is_active IS 'Indicates if employee is currently active';

-- ----------------------------------------------------------------------------
-- 2.4 Interview Type (Catalog Table - No dependencies)
-- ----------------------------------------------------------------------------
CREATE TABLE interview_type (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE interview_type IS 'Catalog of interview types (e.g., Technical, HR, Cultural Fit)';

-- ----------------------------------------------------------------------------
-- 2.5 Interview Flow (Depends on: Company - optional)
-- ----------------------------------------------------------------------------
CREATE TABLE interview_flow (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER,
    description VARCHAR(500) NOT NULL,
    is_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interview_flow_company 
        FOREIGN KEY (company_id) 
        REFERENCES company(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE interview_flow IS 'Configurable interview flows/processes';
COMMENT ON COLUMN interview_flow.is_template IS 'TRUE for global templates, FALSE for company-specific flows';
COMMENT ON COLUMN interview_flow.company_id IS 'NULL indicates a global template flow';

-- ----------------------------------------------------------------------------
-- 2.6 Interview Step (Depends on: Interview Flow, Interview Type)
-- ----------------------------------------------------------------------------
CREATE TABLE interview_step (
    id                SERIAL PRIMARY KEY,
    interview_flow_id INTEGER NOT NULL,
    interview_type_id INTEGER NOT NULL,
    name              VARCHAR(255) NOT NULL,
    order_index       INTEGER NOT NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interview_step_flow 
        FOREIGN KEY (interview_flow_id) 
        REFERENCES interview_flow(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_interview_step_type 
        FOREIGN KEY (interview_type_id) 
        REFERENCES interview_type(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT unique_flow_order 
        UNIQUE (interview_flow_id, order_index)
);

COMMENT ON TABLE interview_step IS 'Individual steps within an interview flow';
COMMENT ON COLUMN interview_step.order_index IS 'Sequential order of steps within a flow (must be unique per flow)';

-- ----------------------------------------------------------------------------
-- 2.7 Location (No dependencies)
-- ----------------------------------------------------------------------------
CREATE TABLE location (
    id         SERIAL PRIMARY KEY,
    city       VARCHAR(100) NOT NULL,
    state      VARCHAR(100),
    country    VARCHAR(100) NOT NULL,
    is_remote  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_location 
        UNIQUE (city, state, country, is_remote)
);

COMMENT ON TABLE location IS 'Normalized location data for job positions';
COMMENT ON COLUMN location.is_remote IS 'TRUE for remote positions, FALSE for on-site';

-- ----------------------------------------------------------------------------
-- 2.8 Position (Depends on: Company, Interview Flow, Location)
-- ----------------------------------------------------------------------------
CREATE TABLE position (
    id                   SERIAL PRIMARY KEY,
    company_id           INTEGER NOT NULL,
    interview_flow_id    INTEGER NOT NULL,
    location_id          INTEGER,
    title                VARCHAR(255) NOT NULL,
    status               position_status NOT NULL DEFAULT 'DRAFT',
    is_visible           BOOLEAN NOT NULL DEFAULT TRUE,
    vacancies            INTEGER NOT NULL DEFAULT 1,
    filled               INTEGER NOT NULL DEFAULT 0,
    job_description      TEXT,
    requirements         TEXT,
    responsibilities     TEXT,
    salary_min           DECIMAL(12, 2),
    salary_max           DECIMAL(12, 2),
    employment_type      employment_type NOT NULL,
    benefits             TEXT,
    application_deadline TIMESTAMP,
    contact_info         VARCHAR(500),
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at           TIMESTAMP,
    
    CONSTRAINT fk_position_company 
        FOREIGN KEY (company_id) 
        REFERENCES company(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_position_interview_flow 
        FOREIGN KEY (interview_flow_id) 
        REFERENCES interview_flow(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_position_location 
        FOREIGN KEY (location_id) 
        REFERENCES location(id) 
        ON DELETE SET NULL,
    
    CONSTRAINT check_salary_range 
        CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min),
    
    CONSTRAINT check_vacancies 
        CHECK (vacancies > 0),
    
    CONSTRAINT check_filled 
        CHECK (filled >= 0 AND filled <= vacancies)
);

COMMENT ON TABLE position IS 'Job positions posted by companies';
COMMENT ON COLUMN position.vacancies IS 'Total number of available positions';
COMMENT ON COLUMN position.filled IS 'Number of positions already filled';
COMMENT ON COLUMN position.deleted_at IS 'Soft delete timestamp (NULL = active)';

-- ----------------------------------------------------------------------------
-- 2.9 Candidate (No dependencies)
-- ----------------------------------------------------------------------------
CREATE TABLE candidate (
    id                  SERIAL PRIMARY KEY,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    email               VARCHAR(255) NOT NULL UNIQUE,
    phone               VARCHAR(20),
    address             VARCHAR(255),
    linkedin_url        VARCHAR(255),
    portfolio_url       VARCHAR(255),
    current_job_title   VARCHAR(255),
    years_of_experience INTEGER,
    created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_experience 
        CHECK (years_of_experience IS NULL OR years_of_experience >= 0)
);

COMMENT ON TABLE candidate IS 'Job candidates who apply for positions';
COMMENT ON COLUMN candidate.years_of_experience IS 'Total years of professional experience';

-- ----------------------------------------------------------------------------
-- 2.10 Education (Depends on: Candidate)
-- ----------------------------------------------------------------------------
CREATE TABLE education (
    id           SERIAL PRIMARY KEY,
    institution  VARCHAR(255) NOT NULL,
    level        education_level NOT NULL,
    degree       VARCHAR(255) NOT NULL,
    start_date   TIMESTAMP NOT NULL,
    end_date     TIMESTAMP,
    candidate_id INTEGER NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_education_candidate 
        FOREIGN KEY (candidate_id) 
        REFERENCES candidate(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE education IS 'Educational background of candidates';
COMMENT ON COLUMN education.level IS 'Education level (e.g., BACHELOR, MASTER, PHD)';
COMMENT ON COLUMN education.degree IS 'Specific degree or field of study (e.g., Computer Science)';

-- ----------------------------------------------------------------------------
-- 2.11 Work Experience (Depends on: Candidate)
-- ----------------------------------------------------------------------------
CREATE TABLE work_experience (
    id           SERIAL PRIMARY KEY,
    company      VARCHAR(255) NOT NULL,
    position     VARCHAR(255) NOT NULL,
    description  TEXT,
    start_date   TIMESTAMP NOT NULL,
    end_date     TIMESTAMP,
    candidate_id INTEGER NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_work_experience_candidate 
        FOREIGN KEY (candidate_id) 
        REFERENCES candidate(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE work_experience IS 'Professional work experience of candidates';

-- ----------------------------------------------------------------------------
-- 2.12 Application (Depends on: Position, Candidate)
-- ----------------------------------------------------------------------------
CREATE TABLE application (
    id               SERIAL PRIMARY KEY,
    position_id      INTEGER NOT NULL,
    candidate_id     INTEGER NOT NULL,
    application_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status           application_status NOT NULL DEFAULT 'PENDING',
    source           application_source DEFAULT 'WEBSITE',
    notes            TEXT,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at       TIMESTAMP,
    
    CONSTRAINT fk_application_position 
        FOREIGN KEY (position_id) 
        REFERENCES position(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_application_candidate 
        FOREIGN KEY (candidate_id) 
        REFERENCES candidate(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_application 
        UNIQUE (position_id, candidate_id)
);

COMMENT ON TABLE application IS 'Candidate applications to job positions';
COMMENT ON COLUMN application.source IS 'Where the application originated from';
COMMENT ON COLUMN application.deleted_at IS 'Soft delete timestamp (NULL = active)';

-- ----------------------------------------------------------------------------
-- 2.13 Resume (Depends on: Candidate, Application)
-- ----------------------------------------------------------------------------
CREATE TABLE resume (
    id             SERIAL PRIMARY KEY,
    file_path      VARCHAR(500) NOT NULL,
    file_type      file_type NOT NULL,
    upload_date    TIMESTAMP NOT NULL,
    candidate_id   INTEGER NOT NULL,
    application_id INTEGER,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resume_candidate 
        FOREIGN KEY (candidate_id) 
        REFERENCES candidate(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_resume_application 
        FOREIGN KEY (application_id) 
        REFERENCES application(id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE resume IS 'Uploaded resumes/CVs for candidates';
COMMENT ON COLUMN resume.application_id IS 'Optional: links resume to specific application';

-- ----------------------------------------------------------------------------
-- 2.14 Interview (Depends on: Application, Interview Step, Employee)
-- ----------------------------------------------------------------------------
CREATE TABLE interview (
    id                SERIAL PRIMARY KEY,
    application_id    INTEGER NOT NULL,
    interview_step_id INTEGER NOT NULL,
    employee_id       INTEGER NOT NULL,
    interview_date    TIMESTAMP NOT NULL,
    duration_minutes  INTEGER,
    location          VARCHAR(255),
    meeting_url       VARCHAR(500),
    result            interview_result NOT NULL DEFAULT 'PENDING',
    score             SMALLINT,
    notes             TEXT,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_interview_application 
        FOREIGN KEY (application_id) 
        REFERENCES application(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_interview_step 
        FOREIGN KEY (interview_step_id) 
        REFERENCES interview_step(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_interview_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employee(id) 
        ON DELETE RESTRICT,
    
    CONSTRAINT check_score_range 
        CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
    
    CONSTRAINT check_duration 
        CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

COMMENT ON TABLE interview IS 'Individual interviews conducted during the application process';
COMMENT ON COLUMN interview.score IS 'Interview score (0-100)';
COMMENT ON COLUMN interview.duration_minutes IS 'Interview duration in minutes';
COMMENT ON COLUMN interview.location IS 'Interview location (e.g., Office, Zoom, Phone)';

-- ============================================================================
-- 3. CREATE INDEXES (Performance Optimization)
-- ============================================================================

-- Industry indexes
CREATE INDEX idx_industry_name ON industry(name);

-- Company indexes
CREATE INDEX idx_company_industry_id ON company(industry_id);

-- Employee indexes
CREATE INDEX idx_employee_company_id ON employee(company_id);
CREATE INDEX idx_employee_email ON employee(email);
CREATE INDEX idx_employee_company_role_active ON employee(company_id, role, is_active);

-- Interview Type indexes
CREATE INDEX idx_interview_type_name ON interview_type(name);

-- Interview Flow indexes
CREATE INDEX idx_interview_flow_company_id ON interview_flow(company_id);
CREATE INDEX idx_interview_flow_is_template ON interview_flow(is_template);

-- Interview Step indexes
CREATE INDEX idx_interview_step_flow_id ON interview_step(interview_flow_id);
CREATE INDEX idx_interview_step_type_id ON interview_step(interview_type_id);

-- Location indexes
CREATE INDEX idx_location_country ON location(country);
CREATE INDEX idx_location_is_remote ON location(is_remote);

-- Position indexes
CREATE INDEX idx_position_company_id ON position(company_id);
CREATE INDEX idx_position_interview_flow_id ON position(interview_flow_id);
CREATE INDEX idx_position_location_id ON position(location_id);
CREATE INDEX idx_position_status ON position(status);
CREATE INDEX idx_position_application_deadline ON position(application_deadline);
CREATE INDEX idx_position_deleted_at ON position(deleted_at);
CREATE INDEX idx_position_company_status_deleted ON position(company_id, status, deleted_at);
CREATE INDEX idx_position_status_employment_type ON position(status, employment_type);

-- Candidate indexes
CREATE INDEX idx_candidate_last_first_name ON candidate(last_name, first_name);

-- Education indexes
CREATE INDEX idx_education_candidate_id ON education(candidate_id);
CREATE INDEX idx_education_institution ON education(institution);

-- Work Experience indexes
CREATE INDEX idx_work_experience_candidate_id ON work_experience(candidate_id);
CREATE INDEX idx_work_experience_company ON work_experience(company);

-- Resume indexes
CREATE INDEX idx_resume_candidate_id ON resume(candidate_id);
CREATE INDEX idx_resume_application_id ON resume(application_id);

-- Application indexes
CREATE INDEX idx_application_position_id ON application(position_id);
CREATE INDEX idx_application_candidate_id ON application(candidate_id);
CREATE INDEX idx_application_status ON application(status);
CREATE INDEX idx_application_deleted_at ON application(deleted_at);
CREATE INDEX idx_application_date ON application(application_date);

-- Interview indexes
CREATE INDEX idx_interview_application_id ON interview(application_id);
CREATE INDEX idx_interview_step_id ON interview(interview_step_id);
CREATE INDEX idx_interview_employee_id ON interview(employee_id);
CREATE INDEX idx_interview_date ON interview(interview_date);
CREATE INDEX idx_interview_result ON interview(result);

-- ============================================================================
-- 4. CREATE TRIGGERS (Automatic updated_at management)
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER trigger_industry_updated_at
    BEFORE UPDATE ON industry
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_company_updated_at
    BEFORE UPDATE ON company
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_employee_updated_at
    BEFORE UPDATE ON employee
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_interview_type_updated_at
    BEFORE UPDATE ON interview_type
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_interview_flow_updated_at
    BEFORE UPDATE ON interview_flow
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_interview_step_updated_at
    BEFORE UPDATE ON interview_step
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_location_updated_at
    BEFORE UPDATE ON location
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_position_updated_at
    BEFORE UPDATE ON position
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_candidate_updated_at
    BEFORE UPDATE ON candidate
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_education_updated_at
    BEFORE UPDATE ON education
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_work_experience_updated_at
    BEFORE UPDATE ON work_experience
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_resume_updated_at
    BEFORE UPDATE ON resume
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_application_updated_at
    BEFORE UPDATE ON application
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_interview_updated_at
    BEFORE UPDATE ON interview
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. SEED DATA (Initial catalog data)
-- ============================================================================

-- Insert default industries
INSERT INTO industry (name) VALUES
    ('Technology'),
    ('Finance'),
    ('Healthcare'),
    ('Education'),
    ('Manufacturing'),
    ('Retail'),
    ('Consulting'),
    ('Media & Entertainment'),
    ('Real Estate'),
    ('Non-Profit');

-- Insert default interview types
INSERT INTO interview_type (name, description) VALUES
    ('Technical', 'Technical skills assessment and coding challenges'),
    ('HR', 'Human resources screening and culture fit evaluation'),
    ('Cultural Fit', 'Assessment of alignment with company values and culture'),
    ('Behavioral', 'Behavioral questions and situational judgment'),
    ('Panel', 'Interview conducted by multiple team members');

-- ============================================================================
-- 6. GRANTS (Optional - Adjust based on your security model)
-- ============================================================================

-- Example: Grant access to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ats_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ats_app_user;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

-- Verification queries (uncomment to run)
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname;
